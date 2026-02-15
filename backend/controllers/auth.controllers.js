import User from "../models/user.models.js"
import bcrypt from "bcryptjs";
import {v2 as cloudinary} from 'cloudinary';
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
export const signup=async (req,res)=>{
    try {
        const {fullName,username,email,password}=req.body;
        const emailRegax=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegax.test(email)){
            return res.status(400).json({error:"Invalid email format"});
        }
        const existingUser=await User.findOne({username});
        if(existingUser){
            return res.status(400).json({error:"Username already exsits"});
        }
        const existingEmail=await User.findOne({email});
        if(existingEmail){
            return res.status(400).json({error:"email already exsits"});
        }
        if(password.length < 6){
            return res.status(400).json({error:"Password must be of 6 characters"})
        }
        //password hashing so that data if stolen soo that privacy is mantained that's it......
        const salt= await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);
        const newUser=new User({
            fullName:fullName,
            email:email,
            username:username,
            password:hashedPassword
        });
        //basic ideas for cookies and tokensssssss
        if (newUser){
            generateTokenAndSetCookie(newUser._id,res)
            await newUser.save();
            res.status(201).json(
                {
                    _id:newUser._id,
                    fullName:newUser.fullName,
                    email:newUser.email,
                    followers:newUser.followers,
                    following:newUser.following,
                    profileImg:newUser.profileImg,
                    coverImg:newUser.coverImg,
                })};


        

        
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
export const login =async(req,res)=>{
    try {
        //so in login we want two kind of stuffs
        //we want to check first that mail exist in our database or not
        //second we have to check for ---
        //is the password for that matches or not so we want thiss
        const {username,password} = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "No user found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        generateTokenAndSetCookie(user._id, res);
        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        });
        
    } catch (error) {
        console.error("login error:", error.message);
        console.error("Full error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
export const logout=async(req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"User logout successfully"});
    } catch (error) {
        console.log("error while looging out");
        res.status(500).json({error:"ERROR"});
    }
};
export const getMe=async(req,res)=>{
    try {
        const user=await User.findById(req.user._id)
        res.status(201).json(user);
    } catch (error) {
        console.log("Error in getMe controller",error.message)
        res.status(500).json({error:"internal Server error"});
    }
     
}

