import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  passengers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  availableSeats: {
    type: Number,
    required: true,
  },
  origin: {
    place: {
      type: String, 
      required: true,
    },
    coordinates: {
      type: [Number],
    }, 
  },
  destination: {
    place: {
      type: String,
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'canceled'],
    default: 'pending',
  },
  price: {
    type: Number, 
  },
  tags: [{
    type: String,
    enum: ['AC', 'Music', 'Pet Friendly', 'No Smoking', 'Ladies Only', 'Express Route']
  }],
  vehicleDetails: {
    vehicleNumber: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
  },
  carbonSavedRide: {
    type: Number,
    default: 0,
  },
  chat: [ 
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      message: String,
      timestamp: Date,
    },
  ],
}, {timestamps:true}
);

export default mongoose.model('Ride', rideSchema);