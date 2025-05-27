import Ride from "../models/Ride.js"
import User from "../models/User.js";
import Rating from "../models/Rating.js";
import { sendSMS } from "../config/twilio.js";

export const getRide = async (req, res, next) => {
  try{
    const ride = await Ride.findById(req.params.id).populate('creator', 'name age stars rating profile ridesCreated createdAt').lean(); 
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.status(200).json(ride); 
  }catch(err){
    next(err);
  }
}

export const getAllRides = async (req, res, next) => {
  try{
    const rides = await Ride.find().populate('creator', 'name stars').lean(); 
    res.status(200).json(rides); 
  }catch(err){
    next(err);
  }
}

export const findRides = async (req, res, next) => {
  try {
    const { from, to, seat, date } = req.query;
    
    // Enhanced validation for query parameters
    if (!from || from === 'undefined') {
      return res.status(400).json({ success: false, message: 'Origin location is required' });
    }
    if (!to || to === 'undefined') {
      return res.status(400).json({ success: false, message: 'Destination location is required' });
    }
    if (!seat || seat === 'undefined' || isNaN(seat)) {
      return res.status(400).json({ success: false, message: 'Valid number of seats is required' });
    }
    if (!date || date === 'undefined' || isNaN(new Date(date).getTime())) {
      return res.status(400).json({ success: false, message: 'Valid date is required' });
    }

    const searchDate = new Date(date)
    searchDate.setHours(0, 0, 0, 0); // Set to midnight of the specified date

    const rides = await Ride.find({
        'origin.place': new RegExp(from, 'i'),
        'destination.place': new RegExp(to, 'i'),
        'availableSeats': { $gte: parseInt(seat) },
        'startTime': { $gte: searchDate.toISOString(), $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000).toISOString() }
    })
    .populate('creator', 'name profilePicture stars') 
    .lean(); 

    res.status(200).json({ success: true, rides });
  } catch (err) {
    console.error('Error in findRides:', err);
    res.status(500).json({ success: false, message: 'Internal server error while searching for rides' });
  }
}

export const joinRide = async (req, res, next) =>{
  try{
    const ride = await Ride.findById(req.params.id).populate('creator', 'name phoneNumber');
    const user = await User.findById(req.user.id);

    if (ride.passengers.includes(req.user.id)) {
      res.status(400).json('You already joined this ride!');
    }
    if (ride.passengers.length >= ride.availableSeats) {
      res.status(400).json('Ride is full!');
    }

    await Ride.updateOne(
      { _id: ride._id },
      { $push: { passengers: req.user.id }, $inc: { availableSeats: -1 } }
    );
    
    await User.updateOne(
      { _id: req.user.id },
      { $push: { ridesJoined: ride._id } }
    );

    // Send SMS notification
    const message = `${user.name} has booked the ride. driver is coming`;
    
    try {
      await sendSMS('+91 7735445191', message);
      console.log('SMS notification sent successfully');
    } catch (smsError) {
      console.error('Failed to send SMS notification:', smsError);
      // Don't fail the ride booking if SMS fails
    }

    res.status(200).json({ message: 'Successfully joined the ride!' });
  }catch(err){
    next(err);
  }
}

export const createRide = async (req, res, next) =>{
  try{
    const newRide = new Ride({...req.body, creator: req.user.id});
    await newRide.save()
    await User.findByIdAndUpdate(req.user.id, { $push: { ridesCreated: newRide._id } });
    res.status(201).json(newRide)
  }catch(err){
    next(err);
  }
}

export const updateRide = async(req, res, next) => {
  try{
    const { ...details } = req.body;
    const ride = await Ride.findByIdAndUpdate(
      req.params.id,
      {
        $set: details,
      },
      {new:true}    
    )
    res.status(200).json({success: true, ride})
  }catch(err){
    next(err)
  }
}

export const deleteRide = async(req, res, next) => {
  try{
    await Ride.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate( req.user.id, { $pull: { ridesCreated: req.params.id } })
    res.status(200).send("ride has been deleted");
  }catch(err){
    next(err)
  }
}

export const rateRide = async(req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user was a passenger in this ride
    if (!ride.passengers.includes(req.user.id)) {
      return res.status(403).json({ message: 'Only passengers can rate this ride' });
    }

    // Check if user has already rated this ride
    const existingRating = await Rating.findOne({
      rater: req.user.id,
      ride: ride._id
    });

    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this ride' });
    }

    const rating = new Rating({
      rater: req.user.id,
      ratedUser: ride.creator,
      stars: req.body.rating,
      ride: ride._id
    });

    await rating.save();

    // Update user's ratings array and recalculate average stars
    const ratedUser = await User.findById(ride.creator);
    ratedUser.ratings.push(rating._id);
    
    const allRatings = await Rating.find({ ratedUser: ride.creator });
    const totalStars = allRatings.reduce((sum, r) => sum + r.stars, 0);
    ratedUser.stars = totalStars / allRatings.length;

    await ratedUser.save();

    res.status(200).json({ message: 'Rating submitted successfully' });
  } catch(err) {
    next(err);
  }
}