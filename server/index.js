import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Use Express CORS middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

const server = http.createServer(app);

// Configure CORS in socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

const userSocketMap = {};

// socket.io logic ...
