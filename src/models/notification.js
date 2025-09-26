import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // người nhận thông báo

    type: { 
      type: String, 
      enum: ["ORDER_CREATED", "ORDER_STATUS", "PROMOTION", "SYSTEM"], 
      required: true 
    }, // loại thông báo

    message: { 
      type: String, 
      required: true 
    }, // nội dung hiển thị

    order: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order" 
    }, // liên kết với đơn hàng (nếu có)

    isRead: { 
      type: Boolean, 
      default: false 
    }, // đã đọc hay chưa

  },
  { timestamps: true } // createdAt, updatedAt
);

export default mongoose.model("Notification", notificationSchema);
