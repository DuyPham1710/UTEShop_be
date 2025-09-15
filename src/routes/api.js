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
import { getUserProfile, updateUserProfile } from "../controllers/userController.js";

//review
import { getReviewsByProduct } from "../controllers/reviewController.js";

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

import { categoryController } from "../controllers/categoryController.js";

// Services
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

  router.get("/products/:id", getProductById);
  router.get("/products", getProductsPerPage);
  router.get("/payment/vnpay_return", checkPayment)
    
 
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
