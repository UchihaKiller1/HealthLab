import User from "../models/user.js"
import jwt from "jsonwebtoken";

export async function RegisterUser(req, res){

    const data = req.body;
    const email = data.email;

    try{

        const existingUser = await User.findOne({ email});
        if (existingUser) {
            return res.status(400).json({ message: "A user already exists with this email" });
        }
        

        const newUser = new User(data);
        await newUser.save();

        // Send success response
        res.status(201).json({ message: "User added successfully!" });



    } catch (e) {
        console.error("Registration error:", e);
        return res.status(500).json({ error: "User registration failed!" });
    }

}

export async function LoginUser(req, res){
    const { usernameOrEmail, password } = req.body;
    try{
        const user = await User.findOne({ $or: [ { email: usernameOrEmail }, { username: usernameOrEmail } ] });
        if(!user){
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const ok = await user.comparePassword(password);
        if(!ok){
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
        res.json({ token, user: { id: user._id, email: user.email, username: user.username, role: user.role } });
    }catch(e){
        console.error("Login error:", e);
        return res.status(500).json({ error: "Login failed" });
    }
}