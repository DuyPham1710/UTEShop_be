import Order from "../../models/order.js";
import product from "../../models/product.js";
import Product from "../../models/product.js";

class OrderService {
    // Lấy đơn hàng theo user ID
    async getOrderByUserId(userId, status) {
        const filter = { user: userId };
        if (status) {
            filter.statusOrder = status;
        }
        // Dùng find thay vì findOne để lấy mảng các order
        return await Order.find(filter).sort({ createdAt: -1 });
    }
    async updateStatus(userId, orderId, newStatus) {
        // chỉ cho phép update đơn hàng thuộc user đang đăng nhập
        return await Order.findOneAndUpdate(
        { _id: orderId, user: userId },
        { statusOrder: newStatus },
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
        if (newStatus === "cancelled") {
        await Promise.all(
            order.items.map((item) =>
            Product.findByIdAndUpdate(
                item.product._id,
                { $inc: { quantity: item.quantity } }
            )
            )
        );
        }

        if (newStatus === "delivered") {
            await Promise.all(
                order.items.map((item) =>
                Product.findByIdAndUpdate(
                    item.product._id,
                    { $inc: { sold: item.quantity } }
                )
                )
            );
        }

        // Cập nhật trạng thái đơn
        const updatedOrder = await this.updateStatus(userId, orderId, newStatus);
        return { updatedOrder, newStatus };
    }
};

export const orderService = new OrderService();
