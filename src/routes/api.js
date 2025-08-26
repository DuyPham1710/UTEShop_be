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

import { getUserProfile } from "../controllers/userController.js";

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

  // Protected routes (authentication required)
  router.use(auth); // Apply auth middleware to all routes below
  router.use(delay); // Apply delay middleware

  // User management routes
  router.get("/profile", getUserProfile);

  return app.use("/v1/api/", router);
};

export default initApiRoutes;
