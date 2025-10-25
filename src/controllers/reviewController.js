import { sendNotification } from "../server.js";
import { getReviewsByProductService, createReviewService, getUsersWhoReviewedProductService, getReviewsByUserService } from "../services/review/reviewService.js";
import Notification from "../models/notification.js";
import mailService from "../services/mail/mailService.js";
import User from "../models/user.js";

export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await getReviewsByProductService(productId);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy review",
      error: error.message,
    });
  }
};

export const getReviewsByUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const reviews = await getReviewsByUserService(userId);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy review",
      error: error.message,
    });
  }
};

export const createReview = async (req, res) => {
  const { orderId, productId, rating, comment } = req.body;
  const reviewData = {
    orderId,
    product: productId,
    userId: req.user.userId,
    rating,
    comment,
  };
  const result = await createReviewService(reviewData);
  if (result.success) {
    // populate product
    await result.data.populate({
      path: "product",
      select: "name",
    });

    // notification review 
    const notification = await Notification.create({
      user: req.user.userId,
      type: "REVIEW_CREATED",
      message: `Bạn vừa đánh giá sản phẩm ${result.data.product.name} thành công!`,
      review: result.data._id,
    });

    sendNotification(req.user.userId, notification);

    // notification reward created
    let messageReward = "";
    if (result.reward.type === "voucher") {
      messageReward = `Chúc mừng bạn đã nhận voucher ${result.reward.code} với giá trị ${result.reward.discountValue}${result.reward.discountType === "percentage" ? "%" : "VNĐ"}`;
    } else {
      messageReward = `Chúc mừng bạn đã nhận ${result.reward.amount} xu vào kho điểm tích lũy của bạn`;
    }

    const notificationReward = await Notification.create({
      user: req.user.userId,
      type: "REWARD_CREATED",
      message: messageReward,
    });

    sendNotification(req.user.userId, notificationReward);

    // Gửi thông báo cho các user đã đánh giá sản phẩm này
    try {
      const usersWhoReviewed = await getUsersWhoReviewedProductService(productId, req.user.userId);

      if (usersWhoReviewed.length > 0) {
        const notificationMessage = `Có người dùng mới đánh giá sản phẩm ${result.data.product.name} mà bạn đã đánh giá trước đó!`;

        // Tạo thông báo cho từng user đã đánh giá
        for (const userId of usersWhoReviewed) {
          const notificationForOthers = await Notification.create({
            user: userId,
            type: "PRODUCT_REVIEWED",
            message: notificationMessage,
            review: result.data._id,
          });

          sendNotification(userId, notificationForOthers);
        }
      }
    } catch (error) {
      console.error("Error sending notifications to other reviewers:", error);
      // Không throw error để không ảnh hưởng đến response chính
    }

    // Gửi email cảm ơn đánh giá cho user
    try {
      const user = await User.findById(req.user.userId).select("fullName email");
      if (user) {
        await mailService.sendReviewSuccessEmail(
          user,
          result.data,
          result.data.product,
          result.reward
        );
      }
    } catch (error) {
      console.error("Error sending review success email:", error);
      // Không throw error để không ảnh hưởng đến response chính
    }

    return res.status(201).json(result);
  } else {
    return res.status(500).json(result);
  }
};
