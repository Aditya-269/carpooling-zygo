import dotenv from "dotenv"
dotenv.config()

import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import cookieParser from "cookie-parser"
import { createServer } from "http"
import chatRoutes from "./routes/chat.routes.js"
import { Server as SocketIOServer } from "socket.io"
import path from 'path'
import { fileURLToPath } from 'url'

import authRoute from "./routes/auth.routes.js"
import userRoute from "./routes/user.routes.js"
import rideRoute from "./routes/ride.routes.js"
import notificationRoute from "./routes/notification.routes.js"
import paymentRoute from "./routes/payment.routes.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8080;
const httpServer = createServer(app);

// Create Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://carpooling-zygo.vercel.app', process.env.ORIGIN]
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
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

// Attach io to app for access in controllers
app.set("io", io);

// Add CORS headers to all responses before other middleware
app.use((req, res, next) => {
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://carpooling-zygo.vercel.app', process.env.ORIGIN]
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
  }
  next();
});

// Handle preflight requests
app.options('*', (req, res) => {
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://carpooling-zygo.vercel.app', process.env.ORIGIN]
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    res.sendStatus(204);
  } else {
    res.sendStatus(403);
  }
});

// Regular CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://carpooling-zygo.vercel.app', process.env.ORIGIN]
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['set-cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
}));

// Add authentication check middleware
app.use((req, res, next) => {
  // Skip auth check for OPTIONS requests
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  // Skip auth check for public routes
  const publicRoutes = ['/api/auth/login', '/api/auth/register'];
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  // Check for authentication token
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  next();
});

app.use(cookieParser())
app.use(express.json())

// API Routes
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

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
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
