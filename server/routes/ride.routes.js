import express from "express";
import { createRide, getAllRides, getRide, updateRide, deleteRide, findRides, joinRide, rateRide, completeRideAndCalculateCarbon } from "../controllers/ride.js";
import { verifyAdmin, verifyToken, verifyUser } from "../utils/verifyToken.js";

const router = express.Router()

// Specific routes first
router.get("/find", findRides)
router.get("/", verifyAdmin, getAllRides)
router.post("/", verifyToken, createRide)

// Parameter routes last
router.get("/:id", getRide)
router.get("/:id/join", verifyToken, joinRide)
router.post("/:id/rate", verifyToken, rateRide)
router.patch("/:id", verifyUser, updateRide)
router.delete("/:id", verifyToken, deleteRide)

// New route to complete a ride and calculate carbon savings
router.post("/:id/complete", verifyToken, async (req, res, next) => {
    try {
        const rideId = req.params.id;
        // Optional: Add checks here to ensure only the driver or relevant party can complete the ride
        // For example: verify that req.user.id is the ride creator

        await completeRideAndCalculateCarbon(rideId);

        res.status(200).json({ message: 'Ride completed and carbon savings calculated.' });
    } catch (err) {
        next(err);
    }
});

export default router