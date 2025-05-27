import User from  "../models/User.js"
import Rating from  "../models/Rating.js"

// Function to calculate and update user trust score
export const calculateAndUpdateTrustScore = async (userId) => {
    try {
        const user = await User.findById(userId).populate('ridesCreated ridesJoined').populate('ratings');
        if (!user) {
            console.error(`User not found for trust score calculation: ${userId}`);
            return;
        }

        // Simple Trust Score Calculation Logic:
        // - Start with the default score (50)
        // - Add points for rides created and joined
        // - Adjust based on average rating
        const baseScore = 50;
        const rideContribution = (user.ridesCreated.length * 2) + user.ridesJoined.length; // Example: more points for creating rides
        const averageRating = user.ratings.length > 0 
            ? user.ratings.reduce((sum, rating) => sum + rating.stars, 0) / user.ratings.length
            : 0;

        // Adjust score based on rating (e.g., average rating * a factor)
        const ratingAdjustment = averageRating * 5; // Example factor

        let calculatedScore = baseScore + rideContribution + ratingAdjustment;

        // Clamp score between 0 and 100
        calculatedScore = Math.max(0, Math.min(100, calculatedScore));

        // Update user's trust score in the database
        user.trustScore = calculatedScore;
        await user.save();

        console.log(`Trust score updated for user ${userId}: ${calculatedScore}`);

    } catch (err) {
        console.error(`Error calculating or updating trust score for user ${userId}:`, err);
    }
};

// Get user details
export const getUser = async (req, res, next) => {
  try{
    const user = await User.findById(req.params.id)
      .populate('ridesCreated ridesJoined')
      .select('-password'); // Exclude password
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user); 
  }catch(err){
    next(err);
  }
}

export const getAllUsers = async(req, res, next)=>{
  try{
    const users = await User.find()
    res.status(200).json(users)
  }catch(err){
    next(err)
  }
}

export const updateUser = async (req, res, next) => {
  try {
    const { name, phoneNumber, profilePicture, age, profile } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name,
          phoneNumber,
          profilePicture,
          age,
          profile
      }},
      {new:true, select: '-password'}    
    )
    res.status(200).json(updatedUser)
  }catch (err) {
    next(err)
  }
}

export const deleteUser = async (req, res, next) => {
  try{
    await User.findByIdAndDelete(req.params.id)
    res.status(200).json("User has been deleted.")
  }catch{
    next(err)
  }
}