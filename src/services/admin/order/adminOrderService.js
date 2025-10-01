// services/adminOrderService.js
import Order from "../../../models/order.js";
import User from "../../../models/user.js";
import Product from "../../../models/product.js";
import { now } from "mongoose";

class AdminOrderService {
  async getOrders({ statusOrder, isDelivered }) {
    const filter = {};

    if (statusOrder) {
      filter.statusOrder = statusOrder;
    }

    if (isDelivered !== undefined) {
      filter.isDelivered = isDelivered === "true"; 
    }

    return await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "username email");
  }

  async updateOrderStatus(orderId, newStatus) {
    const order = await Order.findById(orderId).populate("items.product");
    if (!order) return { error: "Không tìm thấy đơn hàng" };

    // Nếu admin chọn hủy
    if (newStatus === "cancelled") {
      if (order.status === "paid") {
        // hoàn xu lại cho khách
        const user = await User.findById(order.user);
        user.xu += order.totalPrice + order.xu;
        await user.save();
      }

      // cộng lại số lượng tồn kho
      await Promise.all(
        order.items.map((item) =>
          Product.findByIdAndUpdate(item.product._id, {
            $inc: { quantity: item.quantity }
          })
        )
      );
    }

    // Nếu admin chọn delivered → chuyển sang "đã giao nhưng chờ khách xác nhận"
    if (newStatus === "delivered") {
      order.isDelivered = true; // chờ khách xác nhận
    } else {
      order.statusOrder = newStatus;
    }

    await order.save();
    return { updatedOrder: order, newStatus };
  }
}

export const adminOrderService = new AdminOrderService();
