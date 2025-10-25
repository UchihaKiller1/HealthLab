import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import userRouter from "./routes/userRouter.js";
import experimentsRouter from "./routes/experiments.js";
import healthLogsRouter from "./routes/healthLogs.js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Initialize express and http server
const app = express();
const httpServer = createServer(app);

dotenv.config();

// Configure CORS for Express
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
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
  cookie: false
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  console.log('Total connected clients:', io.engine.clientsCount);
  
  // Log all events for this socket for debugging
  const originalEmit = socket.emit;
  socket.emit = function(event, ...args) {
    console.log(`Emitting event '${event}' to socket ${socket.id}:`, ...args);
    return originalEmit.apply(socket, [event, ...args]);
  };

  // Listen for new messages
  socket.on('sendMessage', (message, callback) => {
    console.log('Received sendMessage from', socket.id, ':', message);
    
    try {
      if (!message || !message.text || !message.sender) {
        console.error('Invalid message format:', message);
        return callback({ error: 'Invalid message format' });
      }
      
      // Add server-side timestamp
      message.timestamp = message.timestamp || new Date().toISOString();
      
      console.log('Broadcasting message to all clients:', message);
      
      // Broadcast to all connected clients including the sender
      io.emit('message', message);
      
      console.log('Message broadcast complete');
      
      // Acknowledge successful processing
      callback({ success: true });
    } catch (error) {
      console.error('Error handling message:', error);
      callback({ error: 'Failed to process message' });
    }
  });

  // Debug all incoming events
  socket.onAny((event, ...args) => {
    if (event !== 'message') { // Skip logging 'message' events to reduce noise
      console.log(`Socket ${socket.id} received event '${event}':`, ...args);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);
    console.log('Remaining connected clients:', io.engine.clientsCount);
  });

  socket.on('error', (error) => {
    console.error('Socket error for', socket.id, ':', error);
  });
});

// API endpoint to get chat messages (for initial load)
app.get('/api/messages', (req, res) => {
  // In a real app, you would fetch messages from a database
  res.json([]);
});

// Start the HTTP server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, '0.0.0.0', () => {
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
