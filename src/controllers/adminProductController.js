import Product from "../models/product.js";
import ProductImage from "../models/productImage.js";
import Category from "../models/category.js";
import slugify from "slugify";
import mongoose from "mongoose";


export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discount,
      category,
      quantity,
      images = [],
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: "Thiếu tên hoặc giá sản phẩm" });
    }

    // tạo slug (VD: "Áo thun nam" -> "ao-thun-nam")
    const slug = slugify(name, { lower: true, locale: "vi" });

    // Kiểm tra danh mục tồn tại
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Danh mục không tồn tại",
      });
    }

    // Tạo sản phẩm
    const product = new Product({
      name,
      description,
      price,
      discount,
      category: category,
      quantity,
      slug,
    });
    await product.save();

    // Tạo ảnh nếu có
    if (images && images.length > 0) {
      const imageDocs = await ProductImage.insertMany(
        images.map((img) => ({
          product: product._id,
          url: img.url,
          alt: img.alt || product.name,
        }))
      );
      product.images = imageDocs.map((img) => img._id);
      await product.save();
    }

    res.status(201).json({ success: true, message: "Thêm sản phẩm thành công", data: product });
  } catch (err) {
    console.error("Error addProduct:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      discount,
      category,
      quantity,
      images,
      status,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    // Cập nhật thông tin
    if (name) {
      product.name = name;
      product.slug = slugify(name, { lower: true, locale: "vi" });
    }
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (discount !== undefined) product.discount = discount;
    if (quantity !== undefined) product.quantity = quantity;
    if (isNew !== undefined) product.isNew = isNew;
    if (isHot !== undefined) product.isHot = isHot;
    if (status) product.status = status;

    if (category) {
      const category = await Category.findById(category);
      if (!category)
        return res.status(400).json({ success: false, message: "Danh mục không hợp lệ" });
      product.category = categoryId;
    }

    // Cập nhật ảnh
    if (images && Array.isArray(images)) {
      // Xóa ảnh cũ
      await ProductImage.deleteMany({ product: product._id });
      // Tạo ảnh mới
      const imageDocs = await ProductImage.insertMany(
        images.map((img) => ({
          product: product._id,
          url: img.url,
          alt: img.alt || product.name,
        }))
      );
      product.images = imageDocs.map((img) => img._id);
    }

    await product.save();

    res.json({ success: true, message: "Cập nhật sản phẩm thành công", data: product });
  } catch (err) {
    console.error("Error updateProduct:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    product.status = "deleted";
    await product.save();

    res.json({ success: true, message: "Đã xóa (ẩn) sản phẩm" });
  } catch (err) {
    console.error("Error deleteProduct:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllProductsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { category, keyword } = req.query;
    const filter = {};

    // lọc theo category id hoặc slug
    if (category) {
      filter.$or = [
        { category: category },
        { "category.slug": category }
      ];
    }

    // tìm kiếm theo tên sản phẩm (case-insensitive)
    if (keyword) {
      filter.name = { $regex: keyword, $options: "i" };
    }

    // Query + populate category, images
    const products = await Product.find(filter)
      .populate("category", "name slug")
      .populate("images", "url alt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total
      }
    });
  } catch (err) {
    console.error("Error getAllProductsAdmin:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
