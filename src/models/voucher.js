import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ["percentage", "fixed"], required: true },
  discountValue: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  minOrderValue: { type: Number, default: 0 },
  usageLimit: { type: Number, default: 0 }, // 0 = unlimited
  isPublic: { type: Boolean, default: true },

});

// Xuất model theo ESM
export default mongoose.model("Voucher", voucherSchema);
