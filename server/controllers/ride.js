import Ride from "../models/Ride.js"
import User from "../models/User.js";
import Rating from "../models/Rating.js";
import { calculateAndUpdateTrustScore } from "./user.js"; // Import the function

export const getRide = async (req, res, next) => {
  try{
    const ride = await Ride.findById(req.params.id)
      .populate('creator', 'name age stars rating profile ridesCreated createdAt')
      .populate('passengers', 'name profilePicture carbonSaved'); // Populate passengers and their carbonSaved
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const rideObj = ride.toObject();

    // Calculate CO2 saved for this ride (simplified)
    // This would ideally be calculated once when the ride is completed
    const CARBON_SAVED_PER_PASSENGER_KM = 50; // grams of CO2
    let rideDistanceKm = 0; // You need to get the actual ride distance

    // *** Placeholder for getting actual ride distance ***
    // If you have route data stored, calculate distance from there.
    // For now, let's estimate based on a straight line (requires origin/destination coords)
    if (ride.origin?.coordinates && ride.destination?.coordinates) {
        const [lng1, lat1] = ride.origin.coordinates;
        const [lng2, lat2] = ride.destination.coordinates;
        // Basic Haversine formula for distance - you might use a more accurate method
        const R = 6371; // Radius of Earth in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        rideDistanceKm = R * c;
    }
    // *** End Placeholder ***

    const passengersCount = ride.passengers.length;
    const totalCarbonSavedRide = rideDistanceKm * passengersCount * CARBON_SAVED_PER_PASSENGER_KM; // Total saved by all passengers
    const carbonSavedPerPassengerRide = rideDistanceKm * CARBON_SAVED_PER_PASSENGER_KM; // Saved per passenger

    // Add carbon saved data to the response
    rideObj.carbonSavedRide = carbonSavedPerPassengerRide; // Add this to the ride object sent to frontend
    rideObj.totalCarbonSavedRide = totalCarbonSavedRide; // Optional: total saved by all

    res.status(200).json(rideObj); 
  }catch(err){
    next(err);
  }
}

export const getAllRides = async (req, res, next) => {
  try{
    const rides = await Ride.find().populate('creator', 'name stars trustScore').lean(); 
    res.status(200).json(rides); 
  }catch(err){
    next(err);
  }
}

export const findRides = async (req, res, next) => {
  try {
    const { from, to, seat, date, tags } = req.query;
    
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

    // Build query object
    const query = {
        'origin.place': new RegExp(from, 'i'),
        'destination.place': new RegExp(to, 'i'),
        'availableSeats': { $gte: parseInt(seat) },
        'startTime': { $gte: searchDate.toISOString(), $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000).toISOString() }
    };

    // Add tags filter if provided
    if (tags) {
        const tagArray = tags.split(',');
        query.tags = { $all: tagArray };
    }

    const rides = await Ride.find(query)
        .populate('creator', 'name profilePicture stars trustScore') 
        .lean(); 
    res.status(200).json({ success: true, rides });
  } catch (err) {
    console.error('Error in findRides:', err);
    res.status(500).json({ success: false, message: 'Internal server error while searching for rides' });
  }
}

export const joinRide = async (req, res, next) =>{
  try{
    const ride = await Ride.findById(req.params.id);

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
    ),

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

    // *** Trigger Trust Score Update for the rated user ***
    await calculateAndUpdateTrustScore(ride.creator._id); // Update driver's score

    res.status(200).json({ message: 'Rating submitted successfully' });
  } catch(err) {
    next(err);
  }
}

// Function to reset weekly carbon savings for all users
export const resetWeeklyCarbonSavings = async () => {
    try {
        await User.updateMany({}, { $set: { 'carbonSaved.weekly': 0 } });
        console.log('Weekly carbon savings reset for all users');
    } catch (err) {
        console.error('Error resetting weekly carbon savings:', err);
    }
};

// Function to reset monthly carbon savings for all users
export const resetMonthlyCarbonSavings = async () => {
    try {
        await User.updateMany({}, { $set: { 'carbonSaved.monthly': 0 } });
        console.log('Monthly carbon savings reset for all users');
    } catch (err) {
        console.error('Error resetting monthly carbon savings:', err);
    }
};

// *** New function to handle ride completion and carbon calculation ***
export const completeRideAndCalculateCarbon = async (rideId) => {
    try {
        console.log(`[Carbon Calculation] Starting calculation for ride ${rideId}`);
        const ride = await Ride.findById(rideId).populate('passengers').populate('creator');
        if (!ride) {
            console.error(`[Carbon Calculation] Ride not found for completion: ${rideId}`);
            return;
        }

        // Ensure ride is not already completed
        if (ride.status === 'completed') {
            console.log(`[Carbon Calculation] Ride ${rideId} already completed.`);
            return;
        }

        // Calculate ride distance using Haversine formula
        let rideDistanceKm = 0;
        if (ride.origin?.coordinates && ride.destination?.coordinates) {
            const [lng1, lat1] = ride.origin.coordinates;
            const [lng2, lat2] = ride.destination.coordinates;
            console.log(`[Carbon Calculation] Ride coordinates - Origin: [${lat1}, ${lng1}], Destination: [${lat2}, ${lng2}]`);
            
            const R = 6371; // Radius of Earth in kilometers
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLng = (lng2 - lng1) * Math.PI / 180;
            const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            rideDistanceKm = R * c;
        } else {
            console.error(`[Carbon Calculation] Missing coordinates for ride ${rideId}`);
            console.log('Origin:', ride.origin);
            console.log('Destination:', ride.destination);
        }
        console.log(`[Carbon Calculation] Calculated ride distance: ${rideDistanceKm} km`);

        const CARBON_SAVED_PER_PASSENGER_KM = 50; // grams of CO2
        const carbonSavedPerPassengerRide = rideDistanceKm * CARBON_SAVED_PER_PASSENGER_KM;
        console.log(`[Carbon Calculation] Calculated carbon saved per passenger: ${carbonSavedPerPassengerRide} grams`);

        // Update carbon savings for each passenger
        console.log(`[Carbon Calculation] Updating carbon savings for ${ride.passengers.length} passengers`);
        for (const passenger of ride.passengers) {
            console.log(`[Carbon Calculation] Updating carbon for passenger: ${passenger._id}`);
            const updateResult = await User.findByIdAndUpdate(passenger._id, { 
                $inc: {
                    'carbonSaved.weekly': carbonSavedPerPassengerRide,
                    'carbonSaved.monthly': carbonSavedPerPassengerRide,
                }
            }, { new: true });
            console.log(`[Carbon Calculation] Updated passenger carbon savings:`, updateResult.carbonSaved);
        }

        // Update the ride with carbon savings data and mark as completed
        ride.carbonSavedRide = carbonSavedPerPassengerRide;
        ride.status = 'completed';
        await ride.save();
        console.log(`[Carbon Calculation] Ride ${rideId} marked as completed with carbon savings: ${carbonSavedPerPassengerRide} grams`);

        // Trigger Trust Score Update for participants
        await calculateAndUpdateTrustScore(ride.creator._id);
        for (const passenger of ride.passengers) {
            await calculateAndUpdateTrustScore(passenger._id);
        }

    } catch (err) {
        console.error(`[Carbon Calculation] Error completing ride ${rideId} and calculating carbon:`, err);
        throw err;
    }
};