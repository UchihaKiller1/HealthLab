import express from "express";
import { requireAuth } from "../middlewares/auth.js";
import Friendship from "../models/Friendship.js";
import User from "../models/user.js";

const router = express.Router();

// Get all users (for search)
router.get("/users", requireAuth, async (req, res) => {
    try {
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = search
            ? {
                $or: [
                    { username: { $regex: search, $options: "i" } },
                    { firstname: { $regex: search, $options: "i" } },
                    { lastname: { $regex: search, $options: "i" } }
                ],
                _id: { $ne: req.user.id } // Exclude current user
            }
            : { _id: { $ne: req.user.id } };

        const users = await User.find(query)
            .select("username firstname lastname profilePicture bio")
            .skip(skip)
            .limit(limit)
            .lean();

        // Get friend request status for each user
        const userIds = users.map(u => u._id);
        const friendships = await Friendship.find({
            $or: [
                { requester: req.user.id, recipient: { $in: userIds } },
                { requester: { $in: userIds }, recipient: req.user.id }
            ]
        }).lean();

        const friendshipMap = {};
        friendships.forEach(f => {
            if (f.requester.toString() === req.user.id) {
                friendshipMap[f.recipient.toString()] = { status: `sent_${f.status}`, requestId: f._id };
            } else {
                friendshipMap[f.requester.toString()] = { status: `received_${f.status}`, requestId: f._id };
            }
        });

        const usersWithStatus = users.map(user => {
            const friendship = friendshipMap[user._id.toString()];
            return {
                ...user,
                friendStatus: friendship?.status || null,
                friendshipId: friendship?.requestId || null
            };
        });

        const total = await User.countDocuments(query);

        res.json({
            users: usersWithStatus,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalUsers: total
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

// Send friend request
router.post("/requests", requireAuth, async (req, res) => {
    try {
        const { recipientId } = req.body;

        if (!recipientId) {
            return res.status(400).json({ message: "Recipient ID is required" });
        }

        if (recipientId === req.user.id) {
            return res.status(400).json({ message: "Cannot send friend request to yourself" });
        }

        // Check if friendship already exists
        const existing = await Friendship.findOne({
            $or: [
                { requester: req.user.id, recipient: recipientId },
                { requester: recipientId, recipient: req.user.id }
            ]
        });

        if (existing) {
            return res.status(400).json({ message: "Friend request already exists" });
        }

        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: "User not found" });
        }

        const friendship = new Friendship({
            requester: req.user.id,
            recipient: recipientId,
            status: "pending"
        });

        await friendship.save();

        // Populate the friendship data
        await friendship.populate("requester", "username firstname lastname profilePicture");
        await friendship.populate("recipient", "username firstname lastname profilePicture");

        res.status(201).json(friendship);
    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Failed to send friend request" });
    }
});

// Get pending friend requests (received)
router.get("/requests/pending", requireAuth, async (req, res) => {
    try {
        const requests = await Friendship.find({
            recipient: req.user.id,
            status: "pending"
        })
            .populate("requester", "username firstname lastname profilePicture bio")
            .sort({ createdAt: -1 })
            .lean();

        res.json(requests);
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        res.status(500).json({ message: "Failed to fetch pending requests" });
    }
});

// Get sent friend requests
router.get("/requests/sent", requireAuth, async (req, res) => {
    try {
        const requests = await Friendship.find({
            requester: req.user.id,
            status: "pending"
        })
            .populate("recipient", "username firstname lastname profilePicture bio")
            .sort({ createdAt: -1 })
            .lean();

        res.json(requests);
    } catch (error) {
        console.error("Error fetching sent requests:", error);
        res.status(500).json({ message: "Failed to fetch sent requests" });
    }
});

// Accept friend request
router.patch("/requests/:requestId/accept", requireAuth, async (req, res) => {
    try {
        const { requestId } = req.params;

        const friendship = await Friendship.findOne({
            _id: requestId,
            recipient: req.user.id,
            status: "pending"
        });

        if (!friendship) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        friendship.status = "accepted";
        await friendship.save();

        await friendship.populate("requester", "username firstname lastname profilePicture bio");
        await friendship.populate("recipient", "username firstname lastname profilePicture bio");

        res.json(friendship);
    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({ message: "Failed to accept friend request" });
    }
});

// Reject friend request
router.patch("/requests/:requestId/reject", requireAuth, async (req, res) => {
    try {
        const { requestId } = req.params;

        const friendship = await Friendship.findOne({
            _id: requestId,
            recipient: req.user.id,
            status: "pending"
        });

        if (!friendship) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        friendship.status = "rejected";
        await friendship.save();

        res.json({ message: "Friend request rejected", friendship });
    } catch (error) {
        console.error("Error rejecting friend request:", error);
        res.status(500).json({ message: "Failed to reject friend request" });
    }
});

// Get all friends
router.get("/friends", requireAuth, async (req, res) => {
    try {
        const friendships = await Friendship.find({
            status: "accepted",
            $or: [
                { requester: req.user.id },
                { recipient: req.user.id }
            ]
        })
            .populate("requester", "username firstname lastname profilePicture bio")
            .populate("recipient", "username firstname lastname profilePicture bio")
            .sort({ updatedAt: -1 })
            .lean();

        // Extract the friend (not the current user) from each friendship
        const friends = friendships.map(friendship => {
            if (friendship.requester._id.toString() === req.user.id) {
                return friendship.recipient;
            } else {
                return friendship.requester;
            }
        });

        res.json(friends);
    } catch (error) {
        console.error("Error fetching friends:", error);
        res.status(500).json({ message: "Failed to fetch friends" });
    }
});

// Cancel sent friend request
router.delete("/requests/:requestId", requireAuth, async (req, res) => {
    try {
        const { requestId } = req.params;

        const friendship = await Friendship.findOneAndDelete({
            _id: requestId,
            requester: req.user.id,
            status: "pending"
        });

        if (!friendship) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        res.json({ message: "Friend request cancelled" });
    } catch (error) {
        console.error("Error cancelling friend request:", error);
        res.status(500).json({ message: "Failed to cancel friend request" });
    }
});

// Remove friend
router.delete("/friends/:friendId", requireAuth, async (req, res) => {
    try {
        const { friendId } = req.params;

        const friendship = await Friendship.findOneAndDelete({
            status: "accepted",
            $or: [
                { requester: req.user.id, recipient: friendId },
                { requester: friendId, recipient: req.user.id }
            ]
        });

        if (!friendship) {
            return res.status(404).json({ message: "Friendship not found" });
        }

        res.json({ message: "Friend removed" });
    } catch (error) {
        console.error("Error removing friend:", error);
        res.status(500).json({ message: "Failed to remove friend" });
    }
});

export default router;
