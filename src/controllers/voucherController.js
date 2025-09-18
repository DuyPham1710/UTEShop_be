import UserVoucher from "../models/userVoucher.js";
import Voucher from "../models/voucher.js";
import User from "../models/user.js"; // ✅ thêm import User

export const getVouchersByUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Lấy thông tin user, bao gồm xu
    const user = await User.findById(userId).lean();
    const userXu = user?.xu || 0;

    const userVouchers = await UserVoucher.find({ userId })
      .populate("voucherId")
      .lean();

    const vouchers = userVouchers.map(uv => ({
      id: uv.voucherId._id,
      code: uv.voucherId.code,
      type: uv.voucherId.type,
      discountValue: uv.voucherId.discountValue,
      startDate: uv.voucherId.startDate,
      expiryDate: uv.voucherId.expiryDate,
      minOrderValue: uv.voucherId.minOrderValue,
      usageLimit: uv.voucherId.usageLimit,
      isPublic: uv.voucherId.isPublic,
      usedCount: uv.usedCount,
      maxUsagePerUser: uv.maxUsagePerUser,
      assignedDate: uv.assignedDate,
    }));

    return res.status(200).json({
      success: true,
      vouchers,
      xu: userXu, // ✅ trả về xu
    });
  } catch (error) {
    console.error("getVouchersByUser error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
