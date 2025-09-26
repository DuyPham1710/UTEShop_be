import Notification from "../models/notification.js";

export const createNotification = async (req, res) => {
  try {
    const { userId, type, message, orderId } = req.body;

    const notification = await Notification.create({
      user: userId,
      type,
      message,
      order: orderId || null,
    });

    return res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("createNotification error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 }); // mới nhất lên đầu

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("getNotificationsByUser error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("markNotificationAsRead error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
