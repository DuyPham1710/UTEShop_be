import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from "vnpay";
import Cart from "../models/cart.js";
import Order from "../models/order.js";
import Product from "../models/product.js";

const vnpay = new VNPay({
  tmnCode: "TFCNA2FN",
  secureSecret: "EXQN6SG4HDVMGGKAO3YG73QYHF0W6BW5",
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: "SHA512",
  loggerFn: ignoreLogger,
});

export const createQr = async (req, res) => {
  try {
    console.log("User from req:", req.user);
    const userId = req.user.userId;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const totalPrice = cart.items.reduce((sum, item) => {
        const discountedPrice = item.product.discountPercent
            ? item.product.price * (1 - item.product.discountPercent / 100)
            : item.product.price;

        return sum + discountedPrice * item.quantity;
    }, 0);


    const order = await Order.create({
      user: userId,
      items: cart.items,
      totalPrice,
      status: "pending",
    });

    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: totalPrice,
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_TxnRef: order._id.toString(),
      vnp_OrderInfo: `Thanh toan don hang ${order._id}`,
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
      return res.redirect("http://localhost:3000/cart?status=invalid");
    }

    const orderId = query.vnp_TxnRef;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.redirect("http://localhost:3000/cart?status=notfound");
    }

    if (query.vnp_ResponseCode === "00") {
      order.status = "paid";

      for (const item of order.items) {
        const product = await Product.findById(item.product._id);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();
        }
      }

      await Cart.findOneAndDelete({ user: order.user });
      order.paymentInfo = query;
      await order.save();

      return res.redirect("http://localhost:3000/cart?status=paid");
    } else {
      order.status = "failed";
      order.paymentInfo = query;
      await order.save();

      return res.redirect("http://localhost:3000/cart?status=failed");
    }
  } catch (error) {
    console.error("checkPayment error:", error);
    return res.redirect("http://localhost:3000/cart?status=error");
  }
};

