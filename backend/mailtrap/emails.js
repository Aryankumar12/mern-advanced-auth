import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js"
import { mailtrapClient, sender } from "./mailtrap.config.js"

export const sendVerificationEmail= async(email, verificationToken)=>{
    const recipient = [{email}]

    try{
        const response = await mailtrapClient.send({
            from:sender,
            to:recipient,
            subject: "Verify your email",
            
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        })

        console.log("verification email sent", response)
        

    }catch(err){
        console.log("error sending verification email", err)
        throw new Error("error sending verification email")

    }
}

export const sendWelcomeEmail = async(email, name)=>{
    const recipient = [{email}]
    try{    
       const response =  await mailtrapClient.send({
        from: sender,
        to: recipient,
        template_uuid: "00a8e0f7-2188-4b4f-b55e-259b0e4c222e",
        template_variables: {
          "name": "Test_Name",
          "company_info_name": "Test_Company_info_name"
        
    }
        })

        console.log("welcome email sent", response)

        

    }catch(err){
        console.log("error sending welcome email", err)
        throw new Error("error sending welcome email")

    }
}


export const sendPasswordResetEmail = async(email, resetURL)=>{
    const recipient = [{email}]
    try{
        const response = await mailtrapClient.send({
            from:sender,
            to:recipient,
            subject:"Reset your password",
            html:PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category:"Password Reset"
        })

        console.log("password reset email sent", response)

    }catch(err){
        console.log("error sending password reset email", err)
        throw new Error("error sending password reset email")

    }

}

export const sendResetSuccessEmail = async(email)=>{
    const recipient = [{email}]
    try{
        const response = await mailtrapClient.send({
            from:sender,
            to:recipient,
            subject:"Password reset successful",
            html:PASSWORD_RESET_SUCCESS_TEMPLATE,
            category:"Password Reset"
        })

        console.log("reset success email sent", response)

    }catch(err){
        console.log("error sending reset success email", err)
        throw new Error("error sending reset success email")
    }
}