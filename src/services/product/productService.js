import Product from "../../models/product.js";
import ProductImage from "../../models/productImage.js";
import Review from "../../models/review.js";

export const getProductDetailService = async (productId) => {
  // Tăng lượt xem sản phẩm +1
  const product = await Product.findByIdAndUpdate(
    productId,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate("category", "name description") // lấy thêm tên danh mục
    .lean();

  if (!product) return null;

  // Lấy danh sách hình ảnh
  const images = await ProductImage.find({ product: productId }).select("url alt -_id");

  // Lấy đánh giá sản phẩm (kèm thông tin user)
  const reviews = await Review.find({ product: productId })
    .populate("user", "name email")
    .select("rating comment createdAt");

  // Tính trung bình rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return { ...product, images, reviews, avgRating };
};
