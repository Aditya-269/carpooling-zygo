import Payment from "../models/Payment.js";
import Ride from "../models/Ride.js";

export const createPayment = async (req, res, next) => {
  try {
    const { rideId, paymentId, amount, currency, paymentDetails } = req.body;
    
    console.log('Payment creation request:', {
      rideId,
      paymentId,
      amount,
      currency,
      user: req.user,
      paymentDetails
    });
    
    if (!rideId || !paymentId || !amount) {
      console.error('Missing required fields:', { rideId, paymentId, amount });
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields: rideId, paymentId, and amount are required" 
      });
    }

    // Check user authentication
    if (!req.user || !req.user._id) {
      console.error('User authentication error:', { user: req.user });
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Verify the ride exists
    const ride = await Ride.findById(rideId);
    if (!ride) {
      console.error('Ride not found:', { rideId });
      return res.status(404).json({ 
        success: false,
        message: "Ride not found" 
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ paymentId });
    if (existingPayment) {
      console.log('Payment already exists:', { paymentId });
      return res.status(400).json({ 
        success: false,
        message: "Payment already exists" 
      });
    }

    // Create new payment record
    const newPayment = new Payment({
      ride: rideId,
      payer: req.user._id,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      paymentId,
      status: 'completed',
      paymentMethod: 'paypal',
      paymentDetails: paymentDetails || {}
    });

    console.log('Attempting to save payment:', newPayment);
    const savedPayment = await newPayment.save();
    console.log('Payment saved successfully:', savedPayment);

    // Update ride status if needed
    if (ride.status === 'pending') {
      ride.status = 'active';
      await ride.save();
      console.log('Ride status updated to active:', { rideId });
    }

    res.status(201).json({
      success: true,
      payment: savedPayment
    });
  } catch (err) {
    console.error('Payment creation error:', {
      error: err.message,
      stack: err.stack,
      body: req.body,
      user: req.user
    });
    res.status(500).json({ 
      success: false,
      message: "Failed to create payment",
      error: err.message 
    });
  }
};

export const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('ride')
      .populate('payer', 'name email');
    
    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: "Payment not found" 
      });
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (err) {
    console.error('Get payment error:', err);
    res.status(500).json({ 
      success: false,
      message: "Failed to get payment",
      error: err.message 
    });
  }
};

export const getRidePayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ ride: req.params.rideId })
      .populate('payer', 'name email');
    
    res.status(200).json({
      success: true,
      payments
    });
  } catch (err) {
    console.error('Get ride payments error:', err);
    res.status(500).json({ 
      success: false,
      message: "Failed to get ride payments",
      error: err.message 
    });
  }
}; 