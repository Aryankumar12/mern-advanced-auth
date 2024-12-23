import express from "express";
import dotenv from 'dotenv';
import { connectDb } from "./db/connectDb.js";
import authRoutes from "./routes/auth.js"
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();
const app = express();
import path from "path"
app.use(cookieParser());

const PORT  = process.env.PORT || 5000;
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json()) 

const __dirname = path.resolve();

app.use(cookieParser())

app.use("/api/auth", authRoutes)


if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"frontend/dist")))
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"))
    })
}

app.listen(PORT,()=>{
    connectDb();
    console.log("server is running on port 5000")
})
