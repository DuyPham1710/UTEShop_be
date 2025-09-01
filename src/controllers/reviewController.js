import Review from "../models/review.js";

export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "fullName avt email") // lấy thêm thông tin user
      .sort({ createdAt: -1 }); // review mới nhất lên trước

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
