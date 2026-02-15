//let me eexplain what is a model
//???????
import mongoose from 'mongoose';
const notificationSchema = new mongoose.Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    type:{
        type:String,
        required:true,
        enum:['follow','like']
    },
    read:{
        type:Boolean,
        default:false
    }},{timestamps:true});
const Notification = mongoose.model('Notification',notificationSchema);
export default Notification;
//i dont know why we make models 
//but we have two types of model notifications and the user model
//these are the two types of model which we have made
//u have to put notifications alsoo
//try u can do this
