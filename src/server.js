import express from "express";
import configViewEngine from "./config/viewEngine.js";
import bodyParser from "body-parser";
import initApiRoutes from "./routes/api.js";
import connectDB from "./config/database.js";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();

// config app
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // cho phép FE truy cập
    methods: ["GET", "POST"],
  },
});

// mapping userId -> socketId
const userSockets = {};

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("register", (userId) => {
    const userKey = userId.toString();
    userSockets[userKey] = socket.id;
    console.log(`User ${userKey} registered with socket ${socket.id}`);
  });


  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    // Xóa socketId khỏi mapping khi user disconnect
    for (const userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        break;
      }
    }
  });
});

export const sendNotification = (userId, payload) => {
  const userKey = userId.toString();
  console.log("sendNotification called with:", userKey, payload);

  const socketId = userSockets[userKey];
  if (socketId) {
    io.to(socketId).emit("notification", payload);
    console.log(`Notification sent to user ${userKey}:`, payload);
  } else {
    console.warn(`User ${userKey} is not connected.`);
  }
};


configViewEngine(app);
initApiRoutes(app);

connectDB();

const port = process.env.PORT || 6969;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
