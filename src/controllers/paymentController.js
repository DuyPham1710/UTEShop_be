import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from 'vnpay';

export const createQr = async (req, res) => {
    const vnpay = new VNPay({
        tmnCode: 'TFCNA2FN', // Mã website tại VNPAY
        secureSecret: 'EXQN6SG4HDVMGGKAO3YG73QYHF0W6BW5', // Chuỗi bí mật
        vnpayHost: 'https://sandbox.vnpayment.vn',
        testMode: true, // Chế độ test
        hashAlgorithm: 'SHA512',
        loggerFn: ignoreLogger, // Hàm để ghi log
    });

    const vnpayResponse = await vnpay.buildPaymentUrl({
        // vnp_Amount: findCart.totalPrice * 100,
        vnp_Amount: 500000,
        vnp_IpAddr: '127.0.0.1',
        // vnp_TxnRef: findCart._id,
        vnp_TxnRef: '1234567899',
        // vnp_OrderInfo: `{findCart._id}`,
        vnp_OrderInfo: '1234567899',
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: 'http://localhost:6969/v1/api/payment/vnpay_return',
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: dateFormat(new Date()),
        vnp_ExpireDate: dateFormat(new Date(Date.now() + 15 * 60 * 1000)), // Hết hạn sau 15 phút
    });
    return res.status(201).json({vnpayResponse});
}

export const checkPayment = async (req, res) => {
  try {
    const query = req.query;
    // TODO: verify vnp_SecureHash từ query bằng cách hash lại với secretKey
    console.log("Payment query:", query);

    return res.status(200).json({ success: true, query });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid payment response" });
  }
};
