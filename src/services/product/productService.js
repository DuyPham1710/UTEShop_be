import dotenv from "dotenv";
import Product from "../../models/product.js";
import ProductImage from "../../models/productImage.js";
import Review from "../../models/review.js";
import Fuse from "fuse.js";
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
    const product = await Product.findById(productId)
    .populate("category")
    .populate("images");
    if (!product) {
      return { success: false, message: "Product not found" };
    }

    if (product.status === "deleted") {
      return { success: false, message: "Product has been deleted" };
    }

    return { success: true, product };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, message: "Error fetching product" };
  }
};

export const getProductPerPageService = async (page = 1, limit = 5, category, keyword) => {
  //không lấy status deleted
  try {
    const id = category?.split("-").pop(); // lấy _id từ slug
    const filter = id ? { category: id, status: { $ne: "deleted" } } : { status: { $ne: "deleted" } };

    // Lấy toàn bộ sản phẩm trước (sẽ lọc bằng Fuse.js sau)
    const allProducts = await Product.find(filter)
      .populate({
        path: "images",
        model: ProductImage,
        select: "url alt -_id"
      })
      .populate("category", "name slug")
      .lean();

    let filteredProducts = allProducts;

    // Nếu có keyword, dùng fuzzy search
    if (keyword && keyword.trim() !== "") {
      const fuse = new Fuse(allProducts, {
        keys: ["name"],
        threshold: 0.3, // độ nhạy (0 = chính xác, 1 = mờ nhiều)
      });

      const results = fuse.search(keyword);
      filteredProducts = results.map(r => r.item);
    }

    const totalProducts = filteredProducts.length;

    // Phân trang kết quả
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProducts = filteredProducts.slice(start, end);

    return {
      success: true,
      data: paginatedProducts,
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

// export const getAllCategoriesService = async () => {
//   try {
//     const categories = await Product.distinct("category");
//     console.log(categories);
//     return { success: true, data: categories };
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     return { success: false, message: "Error fetching categories" };
//   }
// };

// export const getAllCategoriesService = async () => {
//   try {
//     const categories = await Category.find({}, "name description"); 
//     // Lấy name + description, bỏ _id nếu không cần
//     return { success: true, data: categories };
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     return { success: false, message: "Error fetching categories" };
//   }
// };

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

  if (product.status === "deleted") {
    return { success: false, message: "Product has been deleted" };
  }

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
