import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    url: { type: String, required: true }, // link ảnh
    alt: { type: String },                 // mô tả alt cho SEO
  },
  { timestamps: true }
);

export default mongoose.model("ProductImage", productImageSchema);
