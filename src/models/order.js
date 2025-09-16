import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        isCommented: { type: Boolean, default: false }, // đã đánh giá hay chưa
      },
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },

    statusOrder: { 
      type: String, 
      enum: ["pending", "preparing", "delivering", "delivered", "cancelled"], 
      default: "pending" 
    }, // trạng thái đơn hàng
    isDelivered: { type: Boolean, default: false }, // Đơn hàng được shipper giao hay chưa

    // address: { type: String, required: true }, 
    // phone: { type: String, required: true },
    // name: { type: String, required: true },
    // note: { type: String },

    paymentInfo: { type: Object }, // lưu response từ VNPay
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
