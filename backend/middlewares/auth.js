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
        return res.status(401).json({ message: "Unauthorized" });
    }
    try{
        const user = await User.findById(req.user.id);
        if(!user || user.role !== "admin"){
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    }catch(e){
        return res.status(500).json({ message: "Auth check failed" });
    }
}


