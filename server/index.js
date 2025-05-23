import express from "express"
import http from "http"
import { Server } from "socket.io"

const app =express()
const server = http.createServer(app);
const io = new Server(server);
io.on('connection',(socket)=>{
  console.log(`User Connected on ${socket.id}`)
})

const PORT = process.env.PORT || 8000;
server.listen(PORT,()=>{
  console.log("Server is listening ")
})