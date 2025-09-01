import mongoose from "mongoose";
import "./category.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },        // tên sản phẩm
    quantity: { type: Number, default: 0 },        // số lượng tồn
    sold: { type: Number, default: 0 },            // đã bán
    description: { type: String },                 // mô tả
    price: { type: Number, required: true },       // giá gốc
    discount: { type: Number, default: 0 },        // % giảm giá
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    views: { type: Number, default: 0 },           // số lượt xem
    
    // Trạng thái sản phẩm
    status: {
      type: String,
      enum: ["available", "out_of_stock", "deleted"],
      default: "available"
    }
  },
  { timestamps: true } // => tự động thêm createdAt, updatedAt
);

export default mongoose.model("Product", productSchema);
