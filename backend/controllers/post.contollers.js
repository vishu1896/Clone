import User from "../models/user.models.js";
import Post from "../models/post.models.js";
import Notification from "../models/notifications.models.js"

//so cloudinary is imported for the images
import {v2 as cloudinary} from 'cloudinary';
export const createPost = async (req , res)=>{
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString();
        const user = await User.findById(userId);
        if(!user){
            return res.status(401).json({message:"no user found"});
        }
        if ((!text) && (!img)){
            return res.status(400).json({message:"please provide proper details"});
        }
        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url || uploadedResponse.url;
        }
       
        const newPost = new Post({
            user:userId,
            text,
            img
        })
        await newPost.save();
        
        res.status(201).json(newPost);

    } catch (error) {
        console.log(error);
        res.status(500).json({error:error.message});
        
    }

}
//as we know every image is passed in cloudinary 
//so we have to make a cloudinary
//after creating anything its been created in postman
//checked in the postman it is working now
//great
//also checked in my database and i can see the post also 
//so great going

export const deletePost = async (req,res) =>{
    try {
        const post =await Post.findById(req.params.id);
        if(!post){
            return res.status(401).json({message:"Post doesn't found"})
        }
        //we can't delete any others post
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({message:"You are not authorised to delete this post"})
        }
        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({message:"post deletd succesfully"});


    } catch (error) {
        console.log("Error in deleting in post:",error);
        res.status(500).json({error:"Internal Server Error"});
        
    }

};
export const commentOnPost = async (req,res) =>{
    try {
        const {text} =req.body;
        const postId =req.params.id;
        const userId =req.user._id;
        if(!text){
            return res.status(400).json({message:"Please provide the text"})
        }
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({message:"No post found"});

        }
        const comment = {user:userId,text};
        post.comments.push(comment);
        await post.save();
        res.status(200).json({message:"Comment added successfully"});



    
} catch (error) {
    console.log("Error in commentPost controller:",error);
    res.status(500).json({error:"Internal Server Error"});
    
}

}
export const likeUnlikePost = async(req,res)=>{
    try {
        const userId = req.user._id;
        const {id:postId} = req.params
        const post = await Post.findById(postId);
        if (!post){
            return res.status(404).json({message:"No post found"});
        }
        const userLikedPost = post.likes.includes(userId);
        if(userLikedPost){
            await Post.updateOne({_id:postId},{$pull:{likes:userId}});
            await User.updateOne({_id:userId},{$pull:{likedPosts:postId}});
            res.status(200).json({message:"Post unliked successfully"})
            //---no notification is required-----

        }else{
            post.likes.push(userId)
            
            await User.updateOne({_id:userId},{$push:{likedPosts:postId}});
            await post.save();
            //here there is need for the notification
            const notification = new Notification({
                from:userId,
                to:post.user,
                type:"like"
            })
            await notification.save()
            res.status(200).json({message:"post liked succesfully"})
        }


    } catch (error) {
        console.log("error in likeulikepost controller:",error);
        res.status(500).json({errror:"internal Server error"});
        
    }

};

//we have two diiferent kinds of id
//first id is of user who wants to like the post and
//the second is of post 
//so in the likes array of that post we have the push the user id simple
export const getAll = async(req,res)=>{
    try {
        const posts = await Post.find().sort({createdAt:-1}).populate({
            path:"user",
            select:"-password"

        });
        //populate method is used to get the user name profileimg otherwise we will not get in the post
        if(posts.length === 0){
            return res.status(200).json([])
            //coz we dont have anything to post
            }
        res.status(200).json(posts);
    } catch (error) {
        console.log("error in getall post:",error);
        res.status(500).json({message:"internal sever error"})
        
    }
}
export const getAllLikes = async (req,res)=>{
    const userId = req.params.id;
   try {
    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({message:"User doesn't found"});
    }
    //we will seacrh for the liked post which we have inserted in the array
    const likedPosts = await Post.find({_id:{$in:user.likedPosts}})
    .populate({
        path:"user",
        select:"-password"
    });
    res.status(200).json(likedPosts);
} catch (error) {
    console.log("errro in getalllikedposts:",error);
    res.status(500).json({message:"internal server error"})
} 
}
export const getFollowingPosts = async(req,res)=>{
    //basic steps pehle dekho apne users ko check karo mere following main kon hain
    try {
        const userId=req.user._id;
        const user = User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        const following =user.following;
        const feedPosts = await Post.find({user:{$in:following}}).sort({createdAt:-1})
        .populate({
            path:"user",
            select:"-password"
        })
        .populate({
            path:"comments.user",
            select:"-password"
        })
        res.status(200).json(feedPosts)
} catch (error) {
        console.log("Error in getting followingPosts:",error);
        res.status(500).json({message:"internal server error"});
    }

}
export const getUserPosts = async(req,res)=>{
    try {
        const {username} = req.params;
        const user =await User.findOne({username});
        if(!user)return res.status(404).json({error:"User Not found"});
        const posts = (await Post.find({user:user._id})).sort({createdAt:-1}).
        populate({
            path:"user",
            select:"-password"
        }).
        populate({
            path:"user",
            select:"-password"
        })
        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getUserPosts controller:",error);
        res.status(500).json({error:"internal server error"});
    }


};

