import express from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notification.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.patch("/:notificationId/read", verifyToken, markAsRead);
router.patch("/read-all", verifyToken, markAllAsRead);

export default router; 