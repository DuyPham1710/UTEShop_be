import { getReviewsByProductService, createReviewService } from "../services/review/reviewService.js";

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

export const createReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  const reviewData = {
    product: productId,
    userId: req.user.userId,
    rating,
    comment,
  };
  const result = await createReviewService(reviewData);
  if (result.success) {
    return res.status(201).json(result);
  } else {
    return res.status(500).json(result);
  }
};
