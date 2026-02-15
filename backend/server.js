import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectMongoDB from "./db/connectMongoose.db.js";
dotenv.config();

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";


const app = express();
const PORT= process.env.PORT ||5000;

app.use(express.json()); //it is used as a middelware to take care of requestsssssss
//second middleware hain and it is for ......-->postman
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.listen(PORT,()=>{
    console.log(`server is runnning ${PORT}`);
    connectMongoDB();
});
//we are creating cookies kind of stuff and we have to generate tokenss
//everything literally eeevrything is going in server.js
//so we have to deal with this
