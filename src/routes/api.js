import express from "express";
// Controllers
import {
  forgotPassword,
  loginUser,
  refreshToken,
  registerUser,
  resendOTP,
  verifyOTP,
} from "../controllers/authController.js";
//user
import { getUserProfile, updateUserProfile, toggleFavoriteProduct, addToViewedProducts, getAllUsers } from "../controllers/userController.js";

//review
import { getReviewsByProduct, createReview, getReviewsByUser } from "../controllers/reviewController.js";

// product
import {
  createProduct,
  getBestSellingProducts,
  //getCategories,
  getNewestProducts,
  getProductById,
  getProductDetail,
  getProductsPerPage,
  getSimilarProducts,
  getTopDiscountProducts,
  getTopViewedProducts,
} from "../controllers/productController.js";

//cart
import {
  addToCart,
  clearCart,
  getCart,
  getCartCount,
  removeFromCart,
  updateCartItem
} from "../controllers/cartController.js";

//order
import { getOrdersByStatus, getOrdersByUserId, updateOrderStatus, getCountOrdersByUser } from "../controllers/orderController.js";

// Middlewares
import auth from "../middleware/auth.js";
import delay from "../middleware/delay.js";

import {
  validateAddToCart,
  validateForgotPassword,
  validateLogin,
  validateRefreshToken,
  validateRegister,
  validateResendOtp,
  validateUpdateCartItem,
  validateVerifyOtp
} from "../middleware/validation.js";

import { addCategory, categoryController } from "../controllers/categoryController.js";

//Admin order
import { getOrderStatusByAdmin, updateOrderStatusByAdmin } from "../controllers/adminOrderController.js"
import {
  getAllProductsAdmin,
  addProduct,
  updateProduct,
  deleteProduct
} from "../controllers/adminProductController.js";

// Services
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import { checkPayment, createQr } from "../controllers/paymentController.js";
import { getVouchersByUser } from "../controllers/voucherController.js";
import { createNotification, getNotificationsByUser, markNotificationAsRead } from "../controllers/notificationController.js";
import { adminUpdateUser, getNewUsers, getRevenueStats, toggleUserActive } from "../controllers/adminController.js";
import {
  getDeliveryAddresses,
  createDeliveryAddress,
  updateDeliveryAddress,
  setDefaultDeliveryAddress,
  deleteDeliveryAddress
} from "../controllers/deliveryAddressController.js";
const router = express.Router();

const initApiRoutes = (app) => {
  router.get("/", (req, res) => {
    return res.status(200).json({ message: "UTEShop API" });
  });


  // Authentication routes with validation
  router.post("/register", validateRegister, registerUser);
  router.post("/login", validateLogin, loginUser);
  router.post("/verify-otp", validateVerifyOtp, verifyOTP);
  router.post("/resend-otp", validateResendOtp, resendOTP);
  router.post("/refresh-token", validateRefreshToken, refreshToken);
  router.post("/forgot-password", validateForgotPassword, forgotPassword);

  // L?y 8 s?n ph?m xem nhi?u nh?t
  router.get("/products/top-viewed", getTopViewedProducts);

  // API l?y 04 s?n ph?m khuy?n m�i cao nh?t
  router.get("/products/top-discount", getTopDiscountProducts);

  //load review
  router.get("/products/:productId/reviews", getReviewsByProduct);

  // Category routes
  router.post("/categories", categoryController.create);
  router.get("/categories", categoryController.list);
  router.get("/categories/:slug-:id", categoryController.detail);

  // Products without id
  router.post("/create-products", createProduct);
  // router.get("/products/categories", getCategories);

  //get product detail
  router.get("/products/:id", getProductDetail);

  // API l?y s?n ph?m tuong t?
  router.get("/products/:id/similar", getSimilarProducts);
  router.get("/newest", getNewestProducts);
  router.get("/best-sellers", getBestSellingProducts);

  //router.get("/products/:id", getProductById);
  router.get("/products", getProductsPerPage);
  router.get("/payment/vnpay_return", checkPayment)


  // Protected routes (authentication required)
  router.use(auth); // Apply auth middleware to all routes below
  router.use(delay); // Apply delay middleware



  // User management routes
  router.get("/profile", getUserProfile);
  router.put("/update-profile", authMiddleware, updateUserProfile);
  router.post('/user/viewed-products', addToViewedProducts);
  router.post('/user/favorite-products', toggleFavoriteProduct);

  // Delivery address routes
  router.get('/user/delivery-addresses', getDeliveryAddresses);
  router.post('/user/delivery-addresses', createDeliveryAddress);
  router.put('/user/delivery-addresses/:id', updateDeliveryAddress);
  router.put('/user/delivery-addresses/:id/default', setDefaultDeliveryAddress);
  router.delete('/user/delivery-addresses/:id', deleteDeliveryAddress);


  // Cart APIs
  router.get("/cart", getCart);
  router.get("/cart/count", getCartCount);
  router.post("/cart/add", validateAddToCart, addToCart);
  router.put("/cart/update", validateUpdateCartItem, updateCartItem);
  router.delete("/cart/remove/:productId", removeFromCart);
  router.delete("/cart/clear", clearCart);

  // Payment
  router.post("/payment/create-qr", createQr)
  router.get("/voucher/my", getVouchersByUser);

  //order
  router.get("/orders/count", getCountOrdersByUser);
  router.get("/orders", getOrdersByStatus);
  router.put("/orders/:orderId/status", updateOrderStatus);
  router.get("/orders/user/:userId", getOrdersByUserId);


  // review
  router.get("/reviews", getReviewsByUser);
  router.post("/reviews", createReview);

  // notification
  router.get("/notifications/:userId", getNotificationsByUser);
  router.post("/notifications", createNotification);
  router.put("/notifications/:id/mark-read", markNotificationAsRead);







  //ADMIN
  // Group admin routes
  router.use(adminMiddleware);

  router.get("/admin/stats/revenue", getRevenueStats);
  router.get("/admin/stats/users", getNewUsers);
  router.get("/admin/orders", getOrderStatusByAdmin);
  router.put("/admin/orders/:orderId/status", updateOrderStatusByAdmin);

  router.get("/admin/users", getAllUsers);

  router.get("/admin/products", getAllProductsAdmin);
  router.delete("/admin/products/:id", deleteProduct);
  router.post("/admin/products", addProduct);
  router.put("/admin/products/:id", updateProduct);

  router.post("/admin/categories", addCategory);
  router.put("/admin/users/:userId/active", toggleUserActive);
  router.put("/admin/users/:userId/update", adminUpdateUser);

  return app.use("/v1/api/", router);
};

export default initApiRoutes;
