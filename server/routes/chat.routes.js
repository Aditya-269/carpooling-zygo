import express from 'express';
import { getChat, postMessage } from '../controllers/chat.js';

const router = express.Router();

router.get('/:rideId', getChat);
router.post('/:rideId', postMessage);

export default router; 