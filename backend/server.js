import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import userRouter from "./routes/userRouter.js";
import experimentsRouter from "./routes/experiments.js";
import healthLogsRouter from "./routes/healthLogs.js";
import friendRouter from "./routes/friendRoutes.js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Message from "./models/Message.js";

// Initialize express and http server
const app = express();
const httpServer = createServer(app);

dotenv.config();

// Configure CORS for Express
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "backend", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "backend", "uploads"))
);

// Configure Socket.IO
const io = new Server(httpServer, {
  cors: corsOptions,
  path: "/socket.io/",
  transports: ["websocket", "polling"],
  pingTimeout: 10000,
  pingInterval: 5000,
  cookie: false,
});

// Socket.IO connection handler
io.on("connection", async (socket) => {
  console.log("A user connected:", socket.id);
  console.log("Total connected clients:", io.engine.clientsCount);

  try {
    // Send last 50 messages to the newly connected user
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "username")
      .lean();

    // Send the messages in chronological order
    socket.emit("previousMessages", messages.reverse());
  } catch (error) {
    console.error("Error fetching messages:", error);
  }

  // Log all events for this socket for debugging
  const originalEmit = socket.emit;
  socket.emit = function (event, ...args) {
    console.log(`Emitting event '${event}' to socket ${socket.id}:`, ...args);
    return originalEmit.apply(socket, [event, ...args]);
  };

  // Listen for new messages
  socket.on("sendMessage", async (message, callback) => {
    console.log("Received sendMessage from", socket.id, ":", message);

    try {
      if (!message || !message.text) {
        console.error("Invalid message format: Missing text");
        return callback({ error: "Message text is required" });
      }

      const isAnonymous = !message.sender || message.sender === 'anonymous';
      const senderName = message.senderName || "Anonymous";

      // Create a new message in the database
      const messageData = {
        text: message.text,
        senderName,
        isAnonymous,
        timestamp: new Date(),
      };

      // Only set sender if it's a valid ObjectId and not anonymous
      if (!isAnonymous && mongoose.Types.ObjectId.isValid(message.sender)) {
        messageData.sender = message.sender;
      }

      const newMessage = new Message(messageData);
      const savedMessage = await newMessage.save();

      console.log("Broadcasting message to all clients:", savedMessage);

      // Prepare the message for broadcasting
      const messageToEmit = {
        _id: savedMessage._id,
        text: savedMessage.text,
        sender: isAnonymous ? 'anonymous' : savedMessage.sender,
        senderName,
        isAnonymous,
        timestamp: savedMessage.createdAt || new Date(),
      };

      // Broadcast to all connected clients including the sender
      io.emit("message", messageToEmit);
      console.log("Message saved and broadcast complete");

      // Acknowledge successful processing
      callback({ success: true, message: messageToEmit });
    } catch (error) {
      console.error("Error handling message:", error);
      callback({ error: "Failed to process message", details: error.message });
    }
  });

  // Debug all incoming events
  socket.onAny((event, ...args) => {
    if (event !== "message") {
      // Skip logging 'message' events to reduce noise
      console.log(`Socket ${socket.id} received event '${event}':`, ...args);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("User disconnected:", socket.id, "Reason:", reason);
    console.log("Remaining connected clients:", io.engine.clientsCount);
  });

  socket.on("error", (error) => {
    console.error("Socket error for", socket.id, ":", error);
  });
});

// API endpoint to get chat messages (for initial load)
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "username");

    res.json(messages.reverse());
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Clear all messages
app.delete("/api/messages", async (req, res) => {
  try {
    await Message.deleteMany({});
    res.json({ success: true, message: "All messages cleared" });
  } catch (error) {
    console.error("Error clearing messages:", error);
    res.status(500).json({ error: "Failed to clear messages" });
  }
});

// Start the HTTP server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

let mongoUrl = process.env.mongo_url;

mongoose.connect(mongoUrl);
let connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB connection established successfully!");
});

app.use("/users", userRouter);
app.use("/api/experiments", experimentsRouter);
app.use("/api/healthlogs", healthLogsRouter);
app.use("/api/friends", friendRouter);
