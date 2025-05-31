import express from "express"
import http from "http"
import { Server } from "socket.io"

const app =express()
const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};

io.on('connection',(socket)=>{
  // console.log(`User Connected on ${socket.id}`)

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
    return {
      socketId,
      username: userSocketMap[socketId], // ✅ Fix: fetch from map
    };
  });
};

socket.on('disconnecting', () => {
  const rooms = [...socket.rooms];

  rooms.forEach((roomId) => {
    socket.in(roomId).emit("disconnected", {
      socketId: socket.id,
      username: userSocketMap[socket.id]
    });
  });
  delete userSocketMap[socket.id]
  socket.leave();
});


  socket.on('join',({roomId,username})=>{
    userSocketMap[socket.id] = username;
    socket.join(roomId)
    
    const clients = getAllConnectedClients(roomId)
    console.log(clients)

    clients.forEach(({socketId})=>{
      io.to(socketId).emit("joined",{
        clients,
        socketId: socket.id,
        username
      })
    })
  })



})



const PORT = process.env.PORT || 8000;
server.listen(PORT,()=>{
  console.log("Server is listening ")
})