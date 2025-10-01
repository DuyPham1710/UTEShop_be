// controllers/adminOrderController.js
import { adminOrderService } from "../services/admin/order/adminOrderService.js";

// admin-order.controller.js
export const getOrderStatusByAdmin = async (req, res) => {
  try {
    const { status, isDelivered } = req.query;
    // query cơ bản
    let query = {};
    if (status) query.status = status;
    if (isDelivered !== undefined) query.isDelivered = isDelivered === "true";

    const orders = await adminOrderService.getOrders(query);

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Không tìm thấy đơn hàng",
        data: { orders: [] },
      });
    }

    // populate thêm product + images
    await Promise.all(
      orders.map((order) =>
        order.populate({
          path: "items.product",
          select: "name price discount images slug",
          populate: { path: "images", select: "url alt" },
        })
      )
    );

    res.json({
      success: true,
      message: "Lấy danh sách đơn hàng thành công",
      data: { orders },
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};


export const updateOrderStatusByAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newStatusOrder } = req.body;

    const { error, updatedOrder, newStatus } =
      await adminOrderService.updateOrderStatus(orderId, newStatusOrder);

    if (error) return res.status(400).json({ success: false, message: error });

    res.json({
      success: true,
      message: `Cập nhật trạng thái đơn hàng thành ${newStatus}`,
      data: updatedOrder
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
