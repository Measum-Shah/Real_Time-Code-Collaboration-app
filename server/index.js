import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const userSocketMap = {};

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
    console.log(`Code-change event in room ${roomId}:`, code);
    socket.to(roomId).emit("code-change", { code });
    console.log(`Broadcast code-change to room ${roomId}`);
  });

  socket.on("sync-code", ({ code, socketId }) => {
    console.log(`Sync-code event to ${socketId}:`, code);
    io.to(socketId).emit("code-change", { code });
    console.log(`Sent code-change to ${socketId}`);
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    console.log(`User ${socket.id} disconnecting from rooms:`, rooms);
    rooms.forEach((roomId) => {
      socket.to(roomId).emit("disconnected", {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
      console.log(`Emitted disconnected event to room ${roomId}`);
    });
    delete userSocketMap[socket.id];
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});