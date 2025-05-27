import express from "express";
import { deleteUser, getAllUsers, getUser, updateUser } from "../controllers/user.js";
import { verifyUser, verifyAdmin } from "../utils/verifyToken.js";
import User from "../models/User.js";

const router = express.Router()

router.get("/", verifyAdmin, getAllUsers)
router.get("/:id", verifyUser, getUser)
router.patch("/:id", verifyUser, updateUser)
router.delete("/:id", verifyUser, deleteUser)

// New route to get user carbon savings
router.get("/:id/carbon-savings", verifyUser, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id, 'carbonSaved');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.carbonSaved);
    } catch (err) {
        next(err);
    }
});

export default router