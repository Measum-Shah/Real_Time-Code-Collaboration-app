import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

const app = express();

// Enable CORS only for the specified frontend URL
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST"],
  credentials: true
}));

// Optional: default route to test if backend is working
app.get("/", (req, res) => {
  res.send("✅ Socket.io backend is running!");
});

const server = http.createServer(app);

// Setup socket.io with CORS for specific origin
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

// In-memory user storage
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  const getAllConnectedClients = (roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
      socketId,
      username: userSocketMap[socketId],
    }));
  };

  socket.on("join", ({ roomId, username }) => {
    console.log(`➡️  ${username} joined room ${roomId}`);
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit("joined", {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-change", { code });
  });

  socket.on("sync-code", ({ code, socketId }) => {
    io.to(socketId).emit("code-change", { code });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.to(roomId).emit("disconnected", {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Use Railway’s injected port or fallback to 8000
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
