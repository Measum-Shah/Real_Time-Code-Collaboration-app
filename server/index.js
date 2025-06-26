import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";

// Load env variables from .env file (only used in local dev)
dotenv.config();

const app = express();

// Enable CORS only for the specified frontend URL
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST"],
  credentials: true
}));

const server = http.createServer(app);

// Setup socket.io with CORS for specific origin
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

// Map to store connected users
const userSocketMap = {};

// Handle socket connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  const getAllConnectedClients = (roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
      socketId,
      username: userSocketMap[socketId],
    }));
  };

  socket.on("join", ({ roomId, username }) => {
    console.log(`Join event: ${username} (socket ${socket.id}) joined room ${roomId}`);
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);
    console.log(`Clients in room ${roomId}:`, clients);

    clients.forEach(({ socketId }) => {
      io.to(socketId).emit("joined", {
        clients,
        username,
        socketId: socket.id,
      });
      console.log(`Emitted joined event to ${socketId}`);
    });
  });

  socket.on("code-change", ({ roomId, code }) => {
    console.log(`Code-change event in room ${roomId}`);
    socket.to(roomId).emit("code-change", { code });
  });

  socket.on("sync-code", ({ code, socketId }) => {
    console.log(`Sync-code event to ${socketId}`);
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
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Choose port from env or fallback to 8000
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
