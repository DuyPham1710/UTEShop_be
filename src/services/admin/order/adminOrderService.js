// services/adminOrderService.js
import Order from "../../../models/order.js";
import User from "../../../models/user.js";
import Product from "../../../models/product.js";
import { now } from "mongoose";
import Notification from "../../../models/notification.js";
import { sendNotification } from "../../../server.js";

class AdminOrderService {
  async getOrders({ status, isDelivered }) {
    const filter = {};

    if (status) {
      filter.statusOrder = status;
    }

    if (isDelivered !== undefined) {
      filter.isDelivered = isDelivered; 
    }

    console.log(filter);
    return await Order.find(filter)
      .sort({ updatedAt: -1 })
      .populate("user", "username email");
  }

  async updateOrderStatus(orderId, newStatus) {
    const order = await Order.findById(orderId).populate("items.product");
    let mess="";
    if (!order) return { error: "Không tìm thấy đơn hàng" };

    // Nếu admin chọn hủy
    if (newStatus === "cancelled" && order.statusOrder !=="cancelled") {
      if (order.status === "paid") {
        // hoàn xu lại cho khách
        const user = await User.findById(order.user);
        user.xu = user.xu + order.totalPrice + order.usedXu;
        console.log("Hoàn xu thành công");
        await user.save();
        mess = `Đơn hàng với mã ${orderId} đã bị admin hủy và số tiền ${order.totalPrice + order.usedXu} đã được cộng vào tài khoản xu của bạn!!!`;
      }
      else{
        mess=`Đơn hàng với mã ${orderId} đã bị admin hủy !!!`;
      }

      // cộng lại số lượng tồn kho
      await Promise.all(
        order.items.map((item) =>
          Product.findByIdAndUpdate(item.product._id, {
            $inc: { quantity: item.quantity }
          })
        )
      );
      console.log("Cộng lại thành công");
    }

    // Nếu admin chọn delivered → chuyển sang "đã giao nhưng chờ khách xác nhận"
    if (newStatus === "delivered") {
      order.isDelivered = true; // chờ khách xác nhận
      order.statusOrder = "delivering";
      order.autoUpdate = new Date(Date.now() + 3 * 60 * 1000);
    } else {
      order.statusOrder = newStatus;
    }

    await order.save();
    
    if(newStatus === "delivered"){
      mess = `Đơn hàng với mã ${orderId} đã được giao đến bạn, vui lòng bấm "Đã nhận hàng" và đánh giá sản phẩm để được nhận những ưu đãi hấp dẫn!!`;
    }
    else if(newStatus === "delivering"){
      mess = `Đơn hàng với mã ${orderId} đã được admin giao cho đơn vị vận chuyển !!`;
    }
    else if(newStatus === "preparing"){
      mess = `Đơn hàng với mã ${orderId} đã được xác nhận !!`;
    }
    console.log(mess);
    if(mess!==""){
      const notification = await Notification.create({
        user: order.user,
        type: "ORDER_STATUS",
        message: mess,
        order: orderId,
      });
      sendNotification(order.user, notification);
    }
    
    return { updatedOrder: order, newStatus };
  }
}

export const adminOrderService = new AdminOrderService();
