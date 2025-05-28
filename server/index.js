import dotenv from "dotenv"
dotenv.config()

import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import cookieParser from "cookie-parser"
import { createServer } from "http"
import chatRoutes from "./routes/chat.routes.js"
import { Server as SocketIOServer } from "socket.io"

import authRoute from "./routes/auth.routes.js"
import userRoute from "./routes/user.routes.js"
import rideRoute from "./routes/ride.routes.js"
import notificationRoute from "./routes/notification.routes.js"
import paymentRoute from "./routes/payment.routes.js"
import { resetWeeklyCarbonSavings, resetMonthlyCarbonSavings } from "./controllers/ride.js"

const app = express()
const PORT = 8080;
const httpServer = createServer(app);

// Create Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'https://carpooling-zygo.vercel.app', 'https://carpooling-zygo.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  },
});

const connectDB = (url) => {
  mongoose.set("strictQuery", true);

  mongoose
    .connect(process.env.MONGO)
    .then(() => console.log("Database connected"))
    .catch((error) => console.log(error));
};

// Attach io to app for access in controllers
app.set("io", io);

//middlewares
app.use(cors({
    origin: ['http://localhost:5173', 'https://carpooling-zygo.vercel.app', 'https://carpooling-zygo.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['set-cookie'],
    maxAge: 86400 // 24 hours
}))
app.use(cookieParser())
app.use(express.json())

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/rides", rideRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/chat", chatRoutes);
app.use("/api/payments", paymentRoute);

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  socket.on("join", ({ rideId }) => {
    socket.join(rideId);
  });

  socket.on("message", ({ rideId, message }) => {
    socket.to(rideId).emit("message", message);
  });

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

// Schedule weekly carbon savings reset (every Monday at midnight)
const scheduleWeeklyReset = () => {
    const now = new Date();
    const daysUntilMonday = (8 - now.getDay()) % 7; // Days until next Monday
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);

    const timeUntilNextMonday = nextMonday.getTime() - now.getTime();
    
    // Schedule the reset
    setTimeout(async () => {
        await resetWeeklyCarbonSavings();
        // Schedule the next reset (7 days later)
        setInterval(resetWeeklyCarbonSavings, 7 * 24 * 60 * 60 * 1000);
    }, timeUntilNextMonday);
};

// Schedule monthly carbon savings reset (first day of each month at midnight)
const scheduleMonthlyReset = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    nextMonth.setHours(0, 0, 0, 0);

    const timeUntilNextMonth = nextMonth.getTime() - now.getTime();
    
    // Schedule the reset
    setTimeout(async () => {
        await resetMonthlyCarbonSavings();
        // Schedule the next reset (approximately 30 days later)
        setInterval(resetMonthlyCarbonSavings, 30 * 24 * 60 * 60 * 1000);
    }, timeUntilNextMonth);
};

// Start the scheduling
scheduleWeeklyReset();
scheduleMonthlyReset();

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
