import { orderService } from "../services/order/orderService.js";


export const getRevenueStats = async (req, res) => {
  try {
    const { from, to, groupBy } = req.query;
    const data = await orderService.getRevenueStats({ from, to, groupBy });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};