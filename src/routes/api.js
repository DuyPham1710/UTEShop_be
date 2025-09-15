import express from "express";

// Controllers
import {
  registerUser,
  loginUser,
  verifyOTP,
  resendOTP,
  refreshToken,
  forgotPassword,
} from "../controllers/authController.js";
//user
import { getUserProfile, updateUserProfile } from "../controllers/userController.js";

//product
import { getProductDetail, getSimilarProducts, getTopViewedProducts, getTopDiscountProducts, getNewestProducts, getBestSellingProducts } from "../controllers/productController.js";

//review
import { getReviewsByProduct } from "../controllers/reviewController.js";

// Middlewares
import auth from "../middleware/auth.js";
import delay from "../middleware/delay.js";

import {
  validateRegister,
  validateLogin,
  validateVerifyOtp,
  validateResendOtp,
  validateRefreshToken,
  validateChangePassword,
  validateForgotPassword,
} from "../middleware/validation.js";

// Services
import { changePassword } from "../services/auth/authService.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkPayment, createQr } from "../controllers/paymentController.js";

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


  // Lấy 8 sản phẩm xem nhiều nhất
  router.get("/products/top-viewed", getTopViewedProducts);

  // API lấy 04 sản phẩm khuyến mãi cao nhất
  router.get("/products/top-discount", getTopDiscountProducts);

  //load review
  router.get("/products/:productId/reviews", getReviewsByProduct);
  
  //get product detail
  router.get("/products/:id", getProductDetail);

  // API lấy sản phẩm tương tự
  router.get("/products/:id/similar", getSimilarProducts);

  router.get("/newest", getNewestProducts);

  router.get("/best-sellers", getBestSellingProducts);

  router.get("/products/:id", getProductById);
  router.get("/products", getProductsPerPage);
  router.get("/payment/vnpay_return", checkPayment)
 
    // Protected routes (authentication required)
    router.use(auth); // Apply auth middleware to all routes below
    router.use(delay); // Apply delay middleware


  // Protected routes (authentication required)
  router.use(auth); // Apply auth middleware to all routes below
  router.use(delay); // Apply delay middleware

  // User management routes
  router.get("/profile", getUserProfile);

  router.put("/update-profile", authMiddleware, updateUserProfile);

  // Cart APIs
  router.get("/cart", getCart);
  router.get("/cart/count", getCartCount);
  router.post("/cart/add", validateAddToCart, addToCart);
  router.put("/cart/update", validateUpdateCartItem, updateCartItem);
  router.delete("/cart/remove/:productId", removeFromCart);
  router.delete("/cart/clear", clearCart);

 router.post("/payment/create-qr", createQr)



  return app.use("/v1/api/", router);
};

export default initApiRoutes;
