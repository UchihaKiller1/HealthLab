import express from "express"
import { RegisterUser, LoginUser } from "../controllers/userConteoller.js";
import { requireAuth } from "../middlewares/auth.js";
import User from "../models/user.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const userRouter = express.Router();

userRouter.post("/register", RegisterUser);
userRouter.post("/login", LoginUser);
userRouter.get("/me", requireAuth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select("email username firstname lastname role profilePicture phone bio");
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            id: user._id,
            email: user.email,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role,
            profilePicture: user.profilePicture,
            phone: user.phone,
            bio: user.bio
        });
    }catch(e){
        res.status(500).json({ message: "Failed to load user" });
    }
});

// Update profile fields: firstname, lastname, username, bio
userRouter.patch("/me", requireAuth, async (req, res) => {
    try{
        const allowed = ["firstname", "lastname", "username", "bio"];
        const updates = {};
        for (const key of allowed) {
            if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                updates[key] = req.body[key];
            }
        }
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true, context: "query" }
        ).select("email username firstname lastname role profilePicture phone bio");
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            id: user._id,
            email: user.email,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role,
            profilePicture: user.profilePicture,
            phone: user.phone,
            bio: user.bio
        });
    }catch(e){
        // Handle duplicate username
        if (e && e.code === 11000) {
            return res.status(400).json({ message: "Username already taken" });
        }
        return res.status(500).json({ message: "Failed to update profile" });
    }
});

// File upload configuration
const uploadsRoot = path.join(process.cwd(), "backend", "uploads");
const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, uploadsRoot);
    },
    filename: function (_req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname) || "";
        cb(null, `${unique}${ext}`);
    }
});
const upload = multer({ storage });

// Upload/replace profile picture
userRouter.post("/me/avatar", requireAuth, upload.single("avatar"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // If user had an existing local file, try to delete it
        if (user.profilePicture && !/^https?:\/\//i.test(user.profilePicture)) {
            const prevPath = path.join(process.cwd(), user.profilePicture.replace(/^\/+/, ""));
            if (fs.existsSync(prevPath)) {
                try { fs.unlinkSync(prevPath); } catch (_e) {}
            }
        }

        // Save relative path served by /uploads
        user.profilePicture = path.join("uploads", req.file.filename).replace(/\\/g, "/");
        await user.save();

        return res.json({
            id: user._id,
            email: user.email,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role,
            profilePicture: user.profilePicture,
            phone: user.phone
        });
    } catch (e) {
        return res.status(500).json({ message: "Failed to upload avatar" });
    }
});

// Remove profile picture
userRouter.delete("/me/avatar", requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.profilePicture && !/^https?:\/\//i.test(user.profilePicture)) {
            const target = path.join(process.cwd(), user.profilePicture.replace(/^\/+/, ""));
            if (fs.existsSync(target)) {
                try { fs.unlinkSync(target); } catch (_e) {}
            }
        }
        user.profilePicture = undefined;
        await user.save();

        return res.json({
            id: user._id,
            email: user.email,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role,
            profilePicture: user.profilePicture,
            phone: user.phone
        });
    } catch (e) {
        return res.status(500).json({ message: "Failed to remove avatar" });
    }
});

export default userRouter;