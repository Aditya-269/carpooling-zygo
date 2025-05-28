import express from "express";
import { createRide, getAllRides, getRide, updateRide, deleteRide, findRides, joinRide, rateRide, completeRideAndCalculateCarbon } from "../controllers/ride.js";
import { verifyAdmin, verifyToken, verifyUser } from "../utils/verifyToken.js";
import Ride from "../models/Ride.js";

const router = express.Router()

router.get("/", verifyAdmin, getAllRides)
router.post("/", verifyToken, createRide)
router.get("/find", findRides)

router.get("/:id", getRide)
router.get("/:id/join", verifyToken, joinRide)
router.post("/:id/rate", verifyToken, rateRide)
router.patch("/:id", verifyUser, updateRide)
router.delete("/:id", verifyToken, deleteRide)

// New route to complete a ride and calculate carbon savings
router.post("/:id/complete", verifyToken, async (req, res, next) => {
    try {
        const rideId = req.params.id;
        console.log(`Attempting to complete ride ${rideId} by user ${req.user.id}`);

        // Verify that the user is the ride creator
        const ride = await Ride.findById(rideId);
        if (!ride) {
            console.error(`Ride ${rideId} not found`);
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.creator.toString() !== req.user.id) {
            console.error(`User ${req.user.id} is not authorized to complete ride ${rideId}`);
            return res.status(403).json({ message: 'Only the ride creator can complete the ride' });
        }

        if (ride.status === 'completed') {
            console.log(`Ride ${rideId} is already completed`);
            return res.status(400).json({ message: 'Ride is already completed' });
        }

        console.log(`Completing ride ${rideId} and calculating carbon savings`);
        await completeRideAndCalculateCarbon(rideId);

        res.status(200).json({ message: 'Ride completed and carbon savings calculated.' });
    } catch (err) {
        console.error('Error completing ride:', err);
        next(err);
    }
});

export default router