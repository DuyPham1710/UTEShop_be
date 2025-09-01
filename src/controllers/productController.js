import mongoose from "mongoose";
import { getProductDetailService } from "../services/product/productService.js";
import Product from "../models/product.js";


//Chi tiết sản phẩm
export const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra ID có hợp lệ không
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

//Sản phẩm tương tự
export const getSimilarProducts = async (req, res) => {
  try {
    const { id } = req.params;

    // kiểm tra sản phẩm hiện tại
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // lấy sản phẩm tương
    const similarProducts = await Product.aggregate([
      {
        $match: {
          category: new mongoose.Types.ObjectId(product.category),
          _id: { $ne: product._id },
          status: "available"
        }
      },
      { $limit: 6 },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $lookup: {
          from: "productimages",
          localField: "_id",
          foreignField: "product",
          as: "images"
        }
      },
      {
        $project: {
          name: 1,
          price: 1,
          discount: 1,
          sold: 1,
          views: 1,
          "category.name": 1,
          images: 1
        }
      }
    ]);

    res.status(200).json(similarProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy 08 sản phẩm được xem nhiều nhất
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
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $lookup: {
          from: "productimages",
          localField: "_id",
          foreignField: "product",
          as: "images"
        }
      },
      {
        $project: {
          name: 1,
          price: 1,
          discount: 1,
          sold: 1,
          views: 1,
          "category.name": 1,
          images: 1
        }
      }
    ]);

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy 04 sản phẩm khuyến mãi cao nhất
// export const getTopDiscountProducts = async (req, res) => {
//   try {
//     const products = await Product.find({ status: "còn" }) // chỉ lấy sản phẩm còn hàng
//       .sort({ discount: -1 }) // sắp xếp giảm dần theo % giảm giá
//       .limit(4) // lấy 4 sản phẩm
//       .populate("category", "name") // lấy thêm tên danh mục
//       .select("name price discount images sold viewCount"); // chỉ lấy các trường cần

//     res.status(200).json(products);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Lỗi server" });
//   }
// };

export const getTopDiscountProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $match: { status: "available" } // chỉ lấy sản phẩm còn hàng
      },
      {
        $addFields: {
          discountAmount: {
            $multiply: ["$price", { $divide: ["$discount", 100] }]
          }
        }
      },
      {
        $sort: { discountAmount: -1 } // sắp xếp theo số tiền giảm
      },
      { $limit: 4 },
      {
        $lookup: {
          from: "categories",            // join Category
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $lookup: {
          from: "productimages",         // join ProductImage
          localField: "_id",
          foreignField: "product",
          as: "images"
        }
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
          images: 1
        }
      }
    ]);

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


