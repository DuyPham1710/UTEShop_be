import cron from "node-cron";
import Order from "../models/order.js";
import User from "../models/user.js";

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

      // cộng tiền cho admin
      const admin = await User.findOne({ isAdmin : true});
      if (admin) {
        admin.xu = admin.xu + order.totalPrice + order.usedXu;
        await admin.save();
      }

      console.log(
        `>>>>>Auto update order ${order._id} -> delivered & admin +${order.totalPrice+order.usedXu}`
      );
    }
  });
}
