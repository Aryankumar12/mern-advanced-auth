import { hash } from "crypto";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";
export const signup = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        if (!email || !password || !name) {
            throw new Error("All fields are required");
        }

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "user already exists" })
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        const verificationToken = Math.floor(1000 + Math.random() * 9000).toString();

        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken: verificationToken,
            verificationTokenExpiresAt: Date.now() + 10 * 60 * 1000
        });

        await user.save();

        generateTokenAndSetCookie(res, user._id)

        await sendVerificationEmail(user.email, verificationToken)
        res.status(201).json({
            success: true,
            message: "user created successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        })
    } catch (err) {

        res.status(400).json({ success: false, message: err.message })

    }

}

export const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({ success: false, message: "invalid or expired verfication code" })
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
        await sendWelcomeEmail(user.email, user.name)

        res.status(200).json({
            success: true,
            message: "email verified successfully",
            user: {
                ...user._doc,
                password: undefined
            },
        })
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message })
    }
}
export const login = async (req, res) => {
    const { email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success: false, message: "User not found"})
        }
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({success: false, message: "invalid credentials"})
        }
        generateTokenAndSetCookie(res, user._id)
        user.lastLogin = new Date();

        res.status(200).json({
            success: true,
            message: "logged in successfully",
            user:{
                ...user._doc,
                password:undefined
            }
        })
    }catch(err){
        res.status(400).json({success: false, message: err.message})

    }
}
export const logout = async (req, res) => {
    res.clearCookie("token")
    res.status(200).json({ success: true, message: "logged out successfully" })
}

export const forgotPassword = async(req, res)=>{
    const {email}= req.body;

    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success:false, message: "User not found"})
        }

        const  resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpireAt = Date.now()+1 * 60*60*1000
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpireAt;

        await user.save();

        //send email
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`)
        res.status(200).json({success:true, message:"password reset email sent"})
    }
    catch(err){
        res.status(400).json({success:false, message: err.message})

    }
}


export const resetPassword= async (req, res)=>{
    try{
        const {token} = req.params;
        const { password} = req.body;
        const user  = await User.findOne({
            resetPasswordToken:token,
            resetPasswordExpiresAt:{$gt:Date.now()}
        })

        if(!user){
            return res.status(400).json({success:false, message:"invalid or expired token"})
        }
        const hashedPassword = await bcryptjs.hash(password, 10);
        user.password = hashedPassword; 
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();
        await sendResetSuccessEmail(user.email)
        res.status(200).json({success:true, message:"password reset successfully"})

    }
    catch(err){

        res.status(400).json({success:false, message:err.message})
    }
}


export const checkAuth = async(req, res)=>{
    try{
        const user = await User.findById(req.userId);
        if(!user){
            return res.status(401).json({success:false, message:"unauthorized"})
        }
        res.status(200).json({success:true, user:{
            ...user._doc,
            password:undefined
        }})

    }
    catch(err){
        res.status(401).json({success:false, message:"unauthorized"})
    }
}