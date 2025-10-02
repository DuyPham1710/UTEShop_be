import Order from "../../models/order.js";
import Product from "../../models/product.js";
import User from "../../models/user.js";
import Notification from "../../models/notification.js";
import { sendNotification } from "../../server.js";
class OrderService {
    // Lấy đơn hàng theo user ID
    async getOrderByUserId(userId, status) {
        const filter = { user: userId };
        if (status) {
            filter.statusOrder = status;
        }
        // Dùng find thay vì findOne để lấy mảng các order
        return await Order.find(filter).sort({ updatedAt: -1 });
    }
    async updateStatus(userId, orderId, newStatus) {
        // chỉ cho phép update đơn hàng thuộc user đang đăng nhập
        return await Order.findOneAndUpdate(
        { _id: orderId, user: userId },
        { statusOrder: newStatus},
        { new: true }
        );
    }
    async findById(orderId) {
        return Order.findById(orderId).populate("items.product");
    }
    async changeStatusAndStock(userId, orderId, currentStatus) {
        let newStatus = null;
        if (currentStatus === "pending") newStatus = "cancelled";
        else if (currentStatus === "delivering") newStatus = "delivered";
        else return { error: "Trạng thái không hợp lệ" };

        const order = await this.findById(orderId);
        if (!order) return { error: "Không tìm thấy đơn hàng" };

        // Hủy đơn: cộng lại tồn kho
        if (newStatus === "cancelled" && order.statusOrder !== "cancelled") {
            await Promise.all(
                order.items.map((item) =>
                Product.findByIdAndUpdate(
                    item.product._id,
                    { $inc: { quantity: item.quantity } }
                )
            )
            
            );
            if (order.status === "paid") {
                // hoàn xu
                const user = await User.findById(userId);
                user.xu += order.totalPrice + order.usedXu;
                await user.save();
            }

            const admin = await User.findOne({ isAdmin: true });
            if (admin) {
                const notification = await Notification.create({
                    user: admin._id,
                    type: "ORDER_STATUS",
                    message: `Đơn hàng với mã ${order._id} đã bị người dùng hủy!!!`,
                    order: order._id,
                });
                sendNotification(admin._id, notification);
            }
        }

        if (newStatus === "delivered" && order.statusOrder !== "delivered") {
            await Promise.all(
                order.items.map((item) =>
                Product.findByIdAndUpdate(
                    item.product._id,
                    { $inc: { sold: item.quantity } }
                )
                )
            );
            //Cộng xu cho Admin 
            const admin = await User.findOne({ isAdmin: true });
            if (admin) {
                admin.xu = admin.xu + order.totalPrice + order.usedXu; // cộng doanh thu
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

        // Cập nhật trạng thái đơn
        const updatedOrder = await this.updateStatus(userId, orderId, newStatus);
        return { updatedOrder, newStatus };
    }

    async getDeliveredOrder() {
        return Order.find({status: "delivered"});
    }

    async getTotalRevenue() {
        const orders = await this.getDeliveredOrders();
        return orders.reduce((sum, o) => sum + o.totalPrice, 0);
    }

    async getRevenueStats({ from, to, groupBy = "day" }) {
        // Chuyển string → Date
        const fromDate = from ? new Date(from) : new Date("1970-01-01");
        const toDate = to ? new Date(to) : new Date();

        // Chọn định dạng group
        let dateFormat;
        if (groupBy === "day") {
        dateFormat = "%Y-%m-%d"; // ví dụ: 2025-09-28
        } else if (groupBy === "month") {
        dateFormat = "%Y-%m";    // ví dụ: 2025-09
        } else {
        throw new Error("Invalid groupBy. Use 'day' or 'month'.");
        }

        const stats = await Order.aggregate([
        {
            $match: {
            statusOrder: "delivered",
            updatedAt: { $gte: fromDate, $lte: toDate },
            },
        },
        {
            $group: {
            _id: { $dateToString: { format: dateFormat, date: "$updatedAt" } },
            totalRevenue: { $sum: "$totalPrice" },
            count: { $sum: 1 }, // số đơn
            },
        },
        { $sort: { _id: 1 } }, // sắp xếp theo thời gian
        ]);

        // format lại response
        return stats.map((s) => ({
        date: s._id,
        revenue: s.totalRevenue,
        orders: s.count,
        }));
    }
};

export const orderService = new OrderService();
