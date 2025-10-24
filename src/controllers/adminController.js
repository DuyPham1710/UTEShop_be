import { orderService } from "../services/order/orderService.js";
import UserService from "../services/user/userService.js";

export const getRevenueStats = async (req, res) => {
  try {
    const { from, to, groupBy } = req.query;
    const data = await orderService.getRevenueStats({ from, to, groupBy });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNewUsers = async (req, res) => {
  try {
    const { from, to, groupBy } = req.query;
    const data = await UserService.getNewUsersStats({ from, to, groupBy });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleUserActive = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body; // true hoặc false

    const result = await UserService.activateUser(userId, isActive);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const adminUpdateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const result = await UserService.adminUpdateUserProfile(userId, updateData);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Error in adminUpdateUser controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

