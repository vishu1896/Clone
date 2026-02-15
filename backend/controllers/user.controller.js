import User from "../models/user.models.js";
import Notification from "../models/notifications.models.js";
// import router from "../routes/auth.routes";
export const getUserProfile = async (req,res)=>{
    //how we will get the username come on tell me
    const {username} = req.params;
    try {
        const user=await User.findOne({username}).select("-password")
        if(!user){
            return res.status(401).json({error:"User doesn't exist"})
        }
        res.status(200).json(user)

    } catch (error) {
        console.log("Error in getting user profile:",error.message);
        res.status(500).json({error:error.message});
    }


};
export const followUnfollowUser = async (req,res) =>{
    try {//here we have 2 kind of users two follow and unfollow 
        //so we have to update in the both section
        if(!req.user || !req.user._id){
            return res.status(401).json({error:"User not authenticated"});
        }
        const {id}=req.params;
        const userToModify=await User.findById(id)
        const currentUser=await User.findById(req.user._id)
        if(id === String(req.user._id)){
            return res.status(400).json({error:"You can't follow/unfollow yourself"})
        }
        if(!userToModify || !currentUser){
            return res.status(400).json({error:"User Not Found"});
        }
        const isfollowing=currentUser.following.includes(id);
        if(isfollowing){
            //then we have to unfollow that
            await User.findByIdAndUpdate(id,{$pull:{followers:req.user._id}});
            await User.findByIdAndUpdate(req.user._id,{$pull:{following:id}});
            res.status(200).json({message:"Unfollowed Successfully"});
        }
        else{
            //agar hamra use follow hi nhi kara arey yaar follow that person
            await User.findByIdAndUpdate(id,{$push:{followers:req.user._id}})
            //kis par dhyan dena hain hamre user par
            //hamri nazare hamre user se hatni nhi chayiee

            //
            await User.findByIdAndUpdate(req.user._id,{$push:{following:id}});
            const newNotification = new Notification({
                type:"follow",
                from:req.user._id,
                to:userToModify,
            
            });
            await newNotification.save();
            res.status(200).json({message:"followed Successfully"});
            }

        
    } catch (error) {
        console.log("Error in followUnfollowUser:",error.message)
        res.status(500).json({error:error.message});
    } 
}
//i really hate postman now
export const getSuggestedUsers =async (req,res) =>{
    try {
        const userId = req.user._id;
        const userFollowedByMe = await User.findById(userId).select("following");
        const users = await User.aggregate([
            {
                $match:{
                    _id:{$ne:userId}
                }},
            {$sample:{size:10}}
        ])
        const fillteredUsers = users.filter(user=>!userFollowedByMe.following.inclues(user._id));
        const suggestedUsers = fillteredUsers.slice(0,4)
        suggestedUsers.forEach(user=>user.password=null)
        res.status(200).json(suggestedUsers);
    
    } catch (error) {
        console.log("Error in getSuggestedUsers:",error.message)
        res.status(500).json({error:error.message});
        
    }

}
// i think you know about aaray function
export const updateUserprofile = async(req,res) =>{
    let {fullName,email,confirmPassword,newPassword,bio,link,username} = req.body;
    let {profileImg,coverImg} = req.body;
    const userId = req.user._id;
    try {
        let user = await User.findById(userId);
        if(!user) {
            return res.status(401).json({message:"User doesn't exist"});
        }
        //there would be a case in both the scenes where we dont have 
        if((newPassword && !confirmPassword) ||(!newPassword && confirmPassword)){
            return res.status(401).json({message:"please fill both details"})
        }
        if(confirmPassword && newPassword){
            const isMatch = await bcrypt.compare(confirmPassword,user.password);
            if(!isMatch){
                return res.status(401).json({message:"password is incorrect"})
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword,salt)

        }
        if (profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }
            const uploadedImg = await cloudinary.uploader.upload(profileImg);
            //these is giving us a respone will use this response
            profileImg = uploadedImg.secure_url;
        }
        if (coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.CoverImg.split("/").pop().split(".")[0]);
            }
            const uploadedImg = await cloudinary.uploader.upload(coverImg);
            //these is giving us a respone will use this response
            coverImg = uploadedImg.secure_url
        }
        //but how we will add these to database 
        //u have to add them on database
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;
        user = await user.save()
        user.password = null
        return res.status(200).json({message:"Updates the details succesfully"})
        //so hamra user profile image hamare database se delete karni hain taki extra storage na hoo
    } catch (error) {
        console.log("Error in updatingUser:",error.message)
        res.status(500).json({error:error.message});

        
    }
}
//testing timee

