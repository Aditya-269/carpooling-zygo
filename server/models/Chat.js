import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema); 