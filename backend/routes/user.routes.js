import express from "express";
import { protectRoutes } from "../middleware/protectRoute.js";
import { getUserProfile, followUnfollowUser,getSuggestedUsers,updateUserprofile} from "../controllers/user.controller.js";
const router=express.Router();
router.get("/profile/:username",protectRoutes,getUserProfile);
router.get("/suggested",protectRoutes,getSuggestedUsers); // Not implemented yet
router.post("/follow/:id",protectRoutes,followUnfollowUser);
router.post("/update",protectRoutes,updateUserprofile); // Not implemented yet
export default router;