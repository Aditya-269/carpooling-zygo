import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cors from "cors"
import cookieParser from "cookie-parser"
import { createServer } from "http"
import { Server as SocketIOServer } from "socket.io"

import authRoute from "./routes/auth.routes.js"
import userRoute from "./routes/user.routes.js"
import rideRoute from "./routes/ride.routes.js"
import notificationRoute from "./routes/notification.routes.js"

const app = express()
const PORT = 8080;

dotenv.config()

const connectDB = (url) => {
  mongoose.set("strictQuery", true);

  mongoose
    .connect(process.env.MONGO)
    .then(() => console.log("Database connected"))
    .catch((error) => console.log(error));
};

// Create HTTP server and Socket.IO server
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.ORIGIN,
    credentials: true,
  },
});

// Attach io to app for access in controllers
app.set("io", io);

//middlewares
app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
  }
))
app.use(cookieParser())
app.use(express.json())

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/rides", rideRoute);
app.use("/api/notifications", notificationRoute);


app.use((err, req, res, next)=>{
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong";
  return res.status(errorStatus).json({
    success: false,
    status: err.status,
    error: errorMessage
  })
})

app.listen = undefined; // Remove default listen

httpServer.listen(PORT, () => {
  connectDB()
  console.log(`Connected to backend on PORT: ${PORT}`)
})

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  // Listen for authentication event to join user-specific room
  socket.on("authenticate", (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`Socket ${socket.id} joined room for user ${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});
