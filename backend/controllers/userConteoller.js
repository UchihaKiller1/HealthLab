import User from "../models/user.js"

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