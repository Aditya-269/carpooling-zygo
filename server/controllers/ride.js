import Ride from "../models/Ride.js"
import User from "../models/User.js";
import Rating from "../models/Rating.js";
import { createNotification } from "./notification.js";
import { format } from "date-fns";

export const getRide = async (req, res, next) => {
  try{
    // Remove lean() to ensure all document properties are preserved
    const ride = await Ride.findById(req.params.id).populate('creator', 'name age stars rating profile ridesCreated createdAt'); 
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Convert to plain object manually to ensure tags are included
    const rideObj = ride.toObject();
    
    // Log the ride object to verify tags are included
    console.log('Ride tags:', rideObj.tags);
    
    res.status(200).json(rideObj); 
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
    const { from, to, seat, date, tags } = req.query;
    
    if (!from || !to || !seat || !date) {
        return res.status(400).json({ message: 'Please provide all the details' });
    }
    const searchDate = new Date(date)
    searchDate.setHours(0, 0, 0, 0); // Set to midnight of the specified date

    // Build query object
    const query = {
        'origin.place': new RegExp(from, 'i'),
        'destination.place': new RegExp(to, 'i'),
        'availableSeats': { $gte: seat},
        'startTime': { $gte: searchDate.toISOString(), $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000).toISOString() }
    };

    // Add tags filter if provided
    if (tags) {
        const tagArray = tags.split(',');
        query.tags = { $all: tagArray };
    }

    const rides = await Ride.find(query)
        .populate('creator', 'name profilePicture stars') 
        .lean(); 
    res.status(200).json({ success: true, rides });
  } catch (err) {
    next(err);
  }
}

export const joinRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('creator', 'name');

    if (ride.creator.toString() === req.user.id) {
      return res.status(400).json('You cannot join your own ride!');
    }
    if (ride.passengers.includes(req.user.id)) {
      return res.status(400).json('You already joined this ride!');
    }
    if (ride.passengers.length >= ride.availableSeats) {
      return res.status(400).json('Ride is full!');
    }

    await Ride.updateOne(
      { _id: ride._id },
      { $push: { passengers: req.user.id }, $inc: { availableSeats: -1 } }
    );
    
    await User.updateOne(
      { _id: req.user.id },
      { $push: { ridesJoined: ride._id } }
    );

    // Fetch the user's name from the database
    const user = await User.findById(req.user.id);
    const userName = user ? user.name : 'Someone';

    // Create notification for the ride creator
    const message = `${userName} has booked your ride from ${ride.origin.place} to ${ride.destination.place} on ${format(new Date(ride.startTime), 'PPp')}`;
    
    await createNotification(
      ride.creator._id,
      req.user.id,
      ride._id,
      message,
      'booking',
      req
    );

    res.status(200).json({ message: 'Successfully joined the ride!' });
  } catch (err) {
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