import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const createNotification = async (recipientId, senderId, rideId, message, type, req = null) => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      ride: rideId,
      message,
      type
    });
    await notification.save();

    if (req && req.app && req.app.get) {
      const io = req.app.get("io");
      if (io) {
        io.to(recipientId.toString()).emit("notification", notification);
      }
    }

    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name profilePicture')
      .populate('ride', 'origin destination startTime')
      .sort({ createdAt: -1 })
      .lean();
    
    res.status(200).json(notifications);
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json(notification);
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}; 