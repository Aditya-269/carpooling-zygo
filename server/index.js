import dotenv from "dotenv"
dotenv.config()

import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import cookieParser from "cookie-parser"
import chatRoutes from "./routes/chat.routes.js"
import http from "http"
import { Server as SocketIOServer } from "socket.io"

import authRoute from "./routes/auth.routes.js"
import userRoute from "./routes/user.routes.js"
import rideRoute from "./routes/ride.routes.js"
import paymentRoute from "./routes/payment.routes.js"

const app = express()
const PORT = 8080;
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.ORIGIN || '*',
    credentials: true,
  },
});

const connectDB = (url) => {
  mongoose.set("strictQuery", true);

  mongoose
    .connect(process.env.MONGO)
    .then(() => console.log("Database connected"))
    .catch((error) => console.log(error));
};

//middlewares
app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
  }
))
app.use(cookieParser())
app.use(express.json())

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/rides", rideRoute);
app.use("/api/chat", chatRoutes);
app.use("/api/payments", paymentRoute);

io.on("connection", (socket) => {
  socket.on("join", ({ rideId }) => {
    socket.join(rideId);
  });
  socket.on("message", ({ rideId, message }) => {
    socket.to(rideId).emit("message", message);
  });
});

app.use((err, req, res, next)=>{
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong";
  return res.status(errorStatus).json({
    success: false,
    status: err.status,
    error: errorMessage
  })
})

server.listen(PORT, () => {
  connectDB()
  console.log(`Connected to backend on PORT: ${PORT}`)
})
