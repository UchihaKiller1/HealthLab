import express from "express";
import userRouter from "./routes/userRouter.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
const app = express();

dotenv.config();

app.listen(4000, ()=>{

    console.log('Listening in port 4000')
})


let mongoUrl = process.env.mongo_url;

mongoose.connect(mongoUrl);
let connection = mongoose.connection;
connection.once("open", ()=>{
    console.log("MongoDB connection established successfully!")
})



app.use("/users", userRouter)