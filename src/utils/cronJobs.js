import cron from "node-cron";
import Order from "../models/order.js";
import User from "../models/user.js";
import Notification from "../models/notification.js";
import { sendNotification } from "../server.js";

export function startCronJobs() {
  // chạy mỗi phút
  cron.schedule("* * * * *", async () => {
    const now = new Date();

    const orders = await Order.find({
        statusOrder: "delivering",
        isDelivered: true,
        autoUpdate: { $lte: now }
    });

    for (const order of orders) {
        order.statusOrder = "delivered";
        order.autoUpdate = null;
        await order.save();
        const notification = await Notification.create({
            user: order.user._id,
            type: "ORDER_STATUS",
            message: `Đơn hàng với mã ${order._id} đã được tự động xác nhận. Cảm hơn vì đã mua sản phẩm của chúng tôi. Hãy đánh giá sản phẩm để nhận được những phần quà hấp dẫn!!!`,
            order: order._id,
        });
        sendNotification(order.user._id, notification);
        // cộng tiền cho admin
        const admin = await User.findOne({ isAdmin : true});
        if (admin) {
            admin.xu = admin.xu + order.totalPrice + order.usedXu;
            await admin.save();
            const notification = await Notification.create({
                user: admin._id,
                type: "ORDER_STATUS",
                message: `Đơn hàng với mã ${order._id} đã được xác nhận giao, số tiền ${order.totalPrice + order.usedXu} đã được cộng vào tài khoản của bạn!!!`,
                order: order._id,
            });
            sendNotification(admin._id, notification);
        }
    }
  });
}
