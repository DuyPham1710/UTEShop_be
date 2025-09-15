import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },              // Giá bán thực tế
  originalPrice: { type: Number },                      // Giá gốc (nếu có khuyến mãi)
  discountPercent: { type: Number },                    // % khuyến mãi
  images: { type: [String], default: [] },              // Danh sách URL hình ảnh
  category: { type: String, required: true },

  // Dùng cho lọc/sắp xếp
  isNew: { type: Boolean, default: false },             // Sản phẩm mới
  isHot: { type: Boolean, default: false },             // Sản phẩm bán chạy
  sold: { type: Number, default: 0 },                   // Số lượng đã bán
  views: { type: Number, default: 0 },                  // Số lượt xem
  stock: { type: Number, default: 0 }                   // Số lượng trong kho
}, { 
  timestamps: true // Tự tạo createdAt, updatedAt (kiểu Date)
});

const Product = mongoose.model("Product", productSchema);

export default Product;
