import express from "express";
import { createPayment, getPayment, getRidePayments } from "../controllers/payment.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createPayment);
router.get("/:id", verifyToken, getPayment);
router.get("/ride/:rideId", verifyToken, getRidePayments);

export default router; 