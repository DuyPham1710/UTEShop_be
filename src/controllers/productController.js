import mongoose from "mongoose";
import Product from "../models/product.js";
import {
  createProductService,
  //getAllCategoriesService,
  getProductByIdService,
  getProductDetailService,
  getProductPerPageService,
} from "../services/product/productService.js";

// Tạo sản phẩm
export const createProduct = async (req, res) => {
  const productData = req.body;
  const result = await createProductService(productData);
  if (result.success) {
    return res.status(201).json(result);
  } else {
    return res.status(500).json(result);
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (req, res) => {
  const { id } = req.params;
  const result = await getProductByIdService(id);
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(404).json(result);
  }
};

// Lấy sản phẩm theo trang
export const getProductsPerPage = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const category = req.query.category;
  const keyword = req.query.keyword || "";

  const result = await getProductPerPageService(page, limit, category, keyword);

  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(500).json(result);
  }
};


// // Lấy tất cả categories
// export const getCategories = async (req, res) => {
//   const result = await getAllCategoriesService();
//   if (result.success) {
//     return res.status(200).json(result);
//   } else {
//     return res.status(500).json(result);
//   }
// };

// Chi tiết sản phẩm
export const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    const product = await getProductDetailService(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Sản phẩm tương tự
export const getSimilarProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const similarProducts = await Product.aggregate([
      {
        $match: {
          category: new mongoose.Types.ObjectId(product.category),
          _id: { $ne: product._id },
          status: "available",
        },
      },
      { $limit: 6 },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $lookup: {
          from: "productimages",
          localField: "_id",
          foreignField: "product",
          as: "images",
        },
      },
      {
        $project: {
          name: 1,
          price: 1,
          discount: 1,
          sold: 1,
          views: 1,
          "category.name": 1,
          images: 1,
        },
      },
    ]);

    res.status(200).json(similarProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Top 8 sản phẩm xem nhiều nhất
export const getTopViewedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $match: { status: "available" } },
      { $sort: { views: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $lookup: {
          from: "productimages",
          localField: "_id",
          foreignField: "product",
          as: "images",
        },
      },
      {
        $project: {
          name: 1,
          price: 1,
          discount: 1,
          sold: 1,
          views: 1,
          "category.name": 1,
          images: 1,
        },
      },
    ]);

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Top 4 sản phẩm khuyến mãi cao nhất
export const getTopDiscountProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $match: { status: "available" } },
      {
        $addFields: {
          discountAmount: {
            $multiply: ["$price", { $divide: ["$discount", 100] }],
          },
        },
      },
      { $sort: { discountAmount: -1 } },
      { $limit: 4 },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $lookup: {
          from: "productimages",
          localField: "_id",
          foreignField: "product",
          as: "images",
        },
      },
      {
        $project: {
          name: 1,
          price: 1,
          discount: 1,
          discountAmount: 1,
          sold: 1,
          views: 1,
          "category.name": 1,
          images: 1,
        },
      },
    ]);

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Top 8 sản phẩm mới nhất
export const getNewestProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $match: { status: "available" } },
      { $sort: { createdAt: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "productimages",
          localField: "_id",
          foreignField: "product",
          as: "images",
        },
      },
      {
        $project: {
          name: 1,
          price: 1,
          discount: 1,
          sold: 1,
          views: 1,
          createdAt: 1,
          "category.name": 1,
          images: 1,
        },
      },
    ]);

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Top 6 sản phẩm bán chạy nhất
export const getBestSellingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const products = await Product.aggregate([
      { $match: { status: "available" } },
      { $sort: { sold: -1 } },
      { $limit: limit  },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "productimages",
          localField: "_id",
          foreignField: "product",
          as: "images",
        },
      },
      {
        $project: {
          name: 1,
          price: 1,
          discount: 1,
          sold: 1,
          views: 1,
          createdAt: 1,
          "category.name": 1,
          images: 1,
        },
      },
    ]);

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
