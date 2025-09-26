import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from "vnpay";
import Cart from "../models/cart.js";
import Order from "../models/order.js";
import Product from "../models/product.js";
import Voucher from "../models/voucher.js";
import UserVoucher from "../models/userVoucher.js";
import User from "../models/user.js";
import { sendNotification } from "../server.js";
import Notification from "../models/notification.js";


const vnpay = new VNPay({
  tmnCode: "TFCNA2FN",
  secureSecret: "EXQN6SG4HDVMGGKAO3YG73QYHF0W6BW5",
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: "SHA512",
  loggerFn: ignoreLogger,
});

const calculateDiscount = (voucher, totalPrice) => {
  let discountAmount = 0;

  if (voucher.type === "percentage") {
    discountAmount = Math.floor(totalPrice * (voucher.discountValue / 100));
  } else if (voucher.type === "fixed") {
    discountAmount = voucher.discountValue;
  } else {
    throw new Error("Loại voucher không hợp lệ");
  }

  return discountAmount > totalPrice ? totalPrice : discountAmount;
};

export const createQr = async (req, res) => {
  try {
    const { items: selectedItems, voucherCode, usedXu = 0 } = req.body;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Giỏ hàng trống" });
    }

    const filteredItems = cart.items.filter(item =>
      selectedItems.includes(item.product._id.toString())
    );
    if (!filteredItems.length) {
      return res.status(400).json({ success: false, message: "Không có sản phẩm được chọn" });
    }

    // Tổng tiền sản phẩm
    let totalPrice = filteredItems.reduce((sum, item) => {
      const discountedPrice = item.product.discount
        ? item.product.price * (1 - item.product.discount / 100)
        : item.product.price;
      return sum + discountedPrice * item.quantity;
    }, 0);

    // Lấy thông tin người dùng
    const user = await User.findById(userId);
    const usedXuNumber = Number(usedXu) || 0;
    const actualUsedXu = Math.min(user.xu || 0, usedXuNumber);
    totalPrice -= actualUsedXu;
    totalPrice = Math.max(0, totalPrice);

    let appliedVoucher = null;
    let discountAmount = 0;

    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode });
      if (!voucher) {
        return res.status(400).json({ success: false, message: "Voucher không tồn tại" });
      }

      const now = new Date();
      if (now < voucher.startDate) {
        return res.status(400).json({ success: false, message: "Voucher chưa có hiệu lực" });
      }
      if (now > voucher.expiryDate) {
        return res.status(400).json({ success: false, message: "Voucher đã hết hạn" });
      }

      if (voucher.minOrderValue && totalPrice < voucher.minOrderValue) {
        return res.status(400).json({
          success: false,
          message: `Đơn hàng phải đạt tối thiểu ${voucher.minOrderValue} để áp dụng voucher`,
        });
      }

      // Kiểm tra giới hạn sử dụng
      const agg = await UserVoucher.aggregate([
        { $match: { voucherId: voucher._id } },
        { $group: { _id: null, totalUsed: { $sum: "$usedCount" } } },
      ]);
      const totalUsed = agg.length ? agg[0].totalUsed : 0;
      if (voucher.usageLimit && totalUsed >= voucher.usageLimit) {
        return res.status(400).json({ success: false, message: "Voucher đã đạt giới hạn sử dụng" });
      }

      let userVoucher = await UserVoucher.findOne({ userId, voucherId: voucher._id });
      if (!voucher.isPublic && !userVoucher) {
        return res.status(400).json({ success: false, message: "Voucher này không được gán cho bạn" });
      }

      if (!userVoucher) {
        userVoucher = await UserVoucher.create({
          userId,
          voucherId: voucher._id,
          usedCount: 0,
          maxUsagePerUser: 1,
          assignedDate: new Date(),
        });
      }

      if (userVoucher.usedCount >= userVoucher.maxUsagePerUser) {
        return res.status(400).json({ success: false, message: "Bạn đã dùng hết số lần cho voucher này" });
      }

      discountAmount = calculateDiscount(voucher, totalPrice);
      totalPrice -= discountAmount;
      appliedVoucher = voucher._id;
    }

    const order = await Order.create({
      user: userId,
      items: filteredItems,
      voucher: appliedVoucher || null,
      discountAmount: discountAmount || 0,
      usedXu: actualUsedXu,
      totalPrice,
      status: "pending",
    });

    if (actualUsedXu > 0) {
      user.xu -= actualUsedXu;
      await user.save();
    }

    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: totalPrice,
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_TxnRef: order._id.toString(),
      vnp_OrderInfo: `Thanh toán đơn hàng ${order._id}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: "http://localhost:6969/v1/api/payment/vnpay_return",
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(new Date(Date.now() + 15 * 60 * 1000)),
    });

    return res.status(201).json({ success: true, url: vnpayResponse });
  } catch (error) {
    console.error("createQr error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const checkPayment = async (req, res) => {
  try {
    const query = req.query;
    const verify = vnpay.verifyReturnUrl(query);

    if (!verify.isVerified) {
      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ status: 'invalid' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }

    const orderId = query.vnp_TxnRef;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ status: 'notfound' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }

    const user = await User.findById(order.user);

    if (query.vnp_ResponseCode === "00") {
      order.status = "paid";

      const notification = await Notification.create({
        user: user._id,
        type: "ORDER_CREATED",
        message: "Bạn vừa tạo đơn hàng thành công!",
        order: order._id,
      });

      sendNotification(user.id, notification);

      for (const item of order.items) {
        const product = await Product.findById(item.product._id);
        if (product) {
          product.quantity = Math.max(0, product.quantity - item.quantity);
          product.sold += item.quantity;
          await product.save();
        }
      }

      await Cart.updateOne(
        { user: order.user },
        { $pull: { items: { product: { $in: order.items.map(i => i.product._id) } } } }
      );

      if (order.voucher) {
        await UserVoucher.findOneAndUpdate(
          { userId: order.user, voucherId: order.voucher },
          { $inc: { usedCount: 1 } },
          { new: true }
        );
      }

      order.paymentInfo = query;
      await order.save();

      // Trả về trang tạm để tự đóng tab
      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ status: 'paid', orderId: '${order._id}' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    } else {
      order.status = "failed";
      order.paymentInfo = query;
      await order.save();

      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ status: 'failed', orderId: '${order._id}' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }
  } catch (error) {
    console.error("checkPayment error:", error);
    return res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ status: 'error' }, '*');
            window.close();
          </script>
        </body>
      </html>
    `);
  }
};

