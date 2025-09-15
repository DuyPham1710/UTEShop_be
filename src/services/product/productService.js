import dotenv from "dotenv";
import Product from "../../models/product.js";
import ProductImage from "../../models/productImage.js";
import Review from "../../models/review.js";

dotenv.config();

export const createProductService = async (productData) => {
  try {
    let result;
    // Nếu productData là mảng -> insertMany
    if (Array.isArray(productData)) {
      const newProducts = await Product.insertMany(productData);
      result = { success: true, message: "Products created successfully", products: newProducts };
    } else {
      // Nếu là object -> create 1 product
      const newProduct = new Product(productData);
      await newProduct.save();
      result = { success: true, message: "Product created successfully", product: newProduct };
    }

    return result;
  } catch (error) {
    console.error("Error creating product(s):", error);
    return { success: false, message: "Error creating product(s)" };
  }
};

export const getProductByIdService = async (productId) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return { success: false, message: "Product not found" };
    }
    return { success: true, product };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, message: "Error fetching product" };
  }
};

export const getProductPerPageService = async (page = 1, limit = 5, category) => {
  try {
    const skip = (page - 1) * limit;

    // nếu có category thì filter
    const filter = category ? { category } : {};

    const products = await Product.find(filter).skip(skip).limit(limit).lean();

    const totalProducts = await Product.countDocuments(filter);

    return {
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, message: "Error fetching products" };
  }
};

export const getAllCategoriesService = async () => {
  try {
    const categories = await Product.distinct("category");
    console.log(categories);
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, message: "Error fetching categories" };
  }
};

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
