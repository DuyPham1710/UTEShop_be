import Review from "../../models/review.js";
import Order from "../../models/order.js";
import Voucher from "../../models/voucher.js";
import UserVoucher from "../../models/userVoucher.js";
import User from "../../models/user.js";

const generateVoucherCode = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RVW-${random}`;
};

export const getReviewsByProductService = async (productId) => {
    try {
        return await Review.find({ product: productId })
            .populate("user", "fullName avt email") // lấy thêm thông tin user
            .sort({ createdAt: -1 });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return { success: false, message: "Error fetching reviews" };
    }
}

export const getUsersWhoReviewedProductService = async (productId, excludeUserId) => {
    try {
        const reviews = await Review.find({
            product: productId,
            user: { $ne: excludeUserId } // loại trừ user hiện tại
        }).populate("user", "fullName email _id");

        // Lấy danh sách unique user IDs (tránh trùng lặp nếu user đánh giá nhiều lần)
        const uniqueUserIds = [...new Set(reviews.map(review => review.user._id.toString()))];

        return uniqueUserIds;
    } catch (error) {
        console.error("Error fetching users who reviewed product:", error);
        return [];
    }
}

export const createReviewService = async (reviewData) => {
    try {
        const { orderId, userId, ...rest } = reviewData;

        const order = await Order.findById(orderId);

        if (!order) {
            return { success: false, message: "Không tìm thấy đơn hàng đã giao cho sản phẩm này" };
        }

        if (String(order.user) !== String(userId)) {
            return { success: false, message: "Bạn không có quyền đánh giá đơn hàng này" };
        }
        if (order.statusOrder !== "delivered") {
            return { success: false, message: "Chỉ có thể đánh giá các đơn hàng đã được giao thành công" };
        }

        // Tìm sản phẩm trong đơn hàng đã giao và chưa đánh giá (logic này vẫn đúng)
        const targetItem = order.items.find(
            (it) => String(it.product) === String(rest.product) && !it.isCommented
        );

        if (!targetItem) {
            return { success: false, message: "Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi" };
        }

        // tạo đánh giá
        const review = await Review.create({ ...rest, user: userId });

        // cập nhật lại trạng thái đánh giá
        targetItem.isCommented = true;
        await order.save();

        // Reward: randomly choose voucher or points (randomly 50% voucher, 50% points)
        const rewardType = Math.random() < 0.5 ? "voucher" : "points";
        let rewardInfo = null;

        if (rewardType === "voucher") {
            const now = new Date();

            // Lấy tất cả voucher hợp lệ
            const availableVouchers = await Voucher.find({
                startDate: { $lte: now },
                expiryDate: { $gte: now },
                $or: [{ usageLimit: 0 }, { usageLimit: { $gt: 0 } }], // 0 = unlimited
                isPublic: true,
            });

            if (!availableVouchers || availableVouchers.length === 0) {
                return null; // Không có voucher hợp lệ
            }

            // random 1 voucher từ availableVouchers
            const randomVoucher =
                availableVouchers[Math.floor(Math.random() * availableVouchers.length)];

            // kiểm tra xem userVoucher đã tồn tại hay chưa, nếu tồn tại thì cập nhập maxUsagePerUser lên 1
            let userVoucher = await UserVoucher.findOne({ userId, voucherId: randomVoucher._id });
            if (userVoucher) {
                userVoucher.maxUsagePerUser += 1;
                await userVoucher.save();
            } else {
                userVoucher = await UserVoucher.create({
                    userId,
                    voucherId: randomVoucher._id,
                    usedCount: 0,
                    maxUsagePerUser: 1,
                    assignedDate: new Date(),
                });

            }

            // Nếu voucher có usageLimit > 0 thì giảm đi 1
            if (randomVoucher.usageLimit > 0) {
                randomVoucher.usageLimit -= 1;
                await randomVoucher.save();
            }

            rewardInfo = {
                type: "voucher",
                code: randomVoucher.code,
                discountValue: randomVoucher.discountValue,
                discountType: randomVoucher.type,
                expiryDate: randomVoucher.expiryDate,
            };
        } else {
            // Random số xu dựa theo giá trị đơn hàng
            const minXu = Math.floor(order.totalPrice * 0.01);   // ít nhất 1% giá trị đơn
            const maxXu = Math.floor(order.totalPrice * 0.1);   // nhiều nhất 10% giá trị đơn
            const points = Math.floor(
                Math.random() * (maxXu - minXu + 1) + minXu
            );

            // Cập nhật số xu của user
            await User.findByIdAndUpdate(userId, { $inc: { xu: points } });
            rewardInfo = {
                type: "points",
                amount: points,
            };
        }

        return { success: true, data: review, reward: rewardInfo };
    } catch (error) {
        console.error("Error creating review:", error);
        return { success: false, message: "Error creating review", error: error.message };
    }
}