import User from "../models/user.js";
import jwt from "jsonwebtoken";

export async function RegisterUser(req, res) {
  const data = req.body;
  const email = data.email;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "A user already exists with this email" });
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

export async function LoginUser(req, res) {
  const { usernameOrEmail, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ error: "Login failed" });
  }
}

export async function updateNotificationPreferences(req, res) {
  try {
    const { emailNotifications } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          'notificationPreferences.emailNotifications': emailNotifications 
        } 
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the updated user data (excluding sensitive information)
    const userData = {
      id: user._id,
      email: user.email,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      profilePicture: user.profilePicture,
      notificationPreferences: user.notificationPreferences
    };

    res.json(userData);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Error updating notification preferences' });
  }
}

export async function getPublicProfile(req, res) {
  try {
    const { userId } = req.params;

    // Find user by ID and select only public fields
    const user = await User.findById(userId).select(
      "firstname lastname username profilePicture bio createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      profilePicture: user.profilePicture || "/default-avatar.png",
      avatar: user.avatar,
      bio: user.bio,
      joinDate: user.createdAt,
      // Uncomment and modify the following if you want to include joined experiments
      // joinedExperiments: await Experiment.find({ participants: userId })
      //   .select('title description') // Add other fields you need
      //   .lean()
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ message: "Server error" });
  }
}
