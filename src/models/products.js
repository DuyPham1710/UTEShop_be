const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  category: String,
  stock: { type: Number, default: 0 },
  imageUrl: String
}, { timestamps: true });


const Product = mongoose.model("Product", productSchema);

module.exports = Product;