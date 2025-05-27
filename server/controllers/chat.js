import Chat from '../models/Chat.js';
import Ride from '../models/Ride.js';

// Get chat messages for a ride
export const getChat = async (req, res) => {
  const { rideId } = req.params;
  const chat = await Chat.findOne({ rideId }).populate('messages.sender', 'name profilePicture');
  res.json(chat || { rideId, messages: [] });
};

// Post a new message (with basic ride participant check)
export const postMessage = async (req, res) => {
  const { rideId } = req.params;
  const { sender, text } = req.body;

  console.log(`Attempting to post message for rideId: ${rideId} by sender: ${sender}`);

  // Check if sender is a participant
  const ride = await Ride.findById(rideId);
  if (!ride) {
    console.log(`Ride not found for id: ${rideId}`);
    return res.status(404).json({ message: 'Ride not found' });
  }

  console.log(`Ride found. Creator: ${ride.creator}, Passengers: ${ride.passengers.join(', ')}`);

  const isParticipant = ride.creator.equals(sender) || ride.passengers.some(p => p.equals(sender));

  console.log(`Is sender a participant? ${isParticipant}`);

  if (!isParticipant) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  let chat = await Chat.findOne({ rideId });
  if (!chat) {
    chat = new Chat({ rideId, messages: [] });
  }
  const message = { sender, text, timestamp: new Date() };
  chat.messages.push(message);
  await chat.save();
  await chat.populate('messages.sender', 'name profilePicture');
  res.json(message);
}; 