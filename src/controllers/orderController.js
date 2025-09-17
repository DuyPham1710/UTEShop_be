import { orderService } from "../services/order/orderService.js";

export const getOrdersByStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query; // ?status=delivering

    const orders = await orderService.getOrderByUserId(userId, status);

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Không tìm thấy đơn hàng",
        data: {
          orders: []
        }
      });
    }
    await Promise.all(
      orders.map(order =>
        order.populate({
          path: "items.product",
          select: "name price discount images slug",
          populate: { path: "images", select: "url alt" },
        })
      )
    );

    res.status(200).json({
      success: true,
      message: "Lấy đơn hàng thành công",
      data: { orders }, // trả về toàn bộ danh sách
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;
    const { statusOrder } = req.body;

    const { error, updatedOrder, newStatus } =
      await orderService.changeStatusAndStock(userId, orderId, statusOrder);

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    res.json({
      success: true,
      message: `Cập nhật đơn hàng thành ${newStatus}`,
      data: updatedOrder,
    });
  } catch (err) {
    console.error("Update Order Status Error:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
