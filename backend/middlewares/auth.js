import jwt from "jsonwebtoken";
import User from "../models/user.js";

export function requireAuth(req, res, next){
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if(!token){
        return res.status(401).json({ message: "Unauthorized" });
    }
    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
        req.user = payload;
        next();
    }catch(e){
        return res.status(401).json({ message: "Invalid token" });
    }
}

export async function requireAdmin(req, res, next){
    if(!req.user){
        console.log("requireAdmin: No user in request");
        return res.status(401).json({ message: "Unauthorized" });
    }
    try{
        console.log("requireAdmin: Checking user role for user ID:", req.user.id);
        const user = await User.findById(req.user.id);
        console.log("requireAdmin: Found user:", { id: user?._id, role: user?.role });
        if(!user || user.role !== "admin"){
            console.log("requireAdmin: Access denied - user role:", user?.role);
            return res.status(403).json({ message: "Forbidden" });
        }
        console.log("requireAdmin: Access granted for admin user");
        next();
    }catch(e){
        console.error("requireAdmin: Error checking user:", e);
        return res.status(500).json({ message: "Auth check failed" });
    }
}


