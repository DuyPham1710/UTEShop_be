const express = require('express');
const {
    registerUser,
    loginUser,
    verifyOTP,
    resendOTP,
    refreshToken,
    forgotPassword
} = require('../controllers/authController.js');

const {
    getUserProfile
} = require('../controllers/userController.js');

const auth = require('../middleware/auth.js');
const delay = require('../middleware/delay.js');
const {
    validateRegister,
    validateLogin,
    validateVerifyOtp,
    validateResendOtp,
    validateRefreshToken,
    validateChangePassword,
    validateForgotPassword,
} = require('../middleware/validation.js');
const { changePassword } = require('../services/auth/authService.js');

const { createProduct, getProductById, getProductsPerPage } = require("../controllers/productController");

let router = express.Router();

let initApiRoutes = (app) => {
    router.get('/', (req, res) => {
        return res.status(200).json({ message: 'UTEShop API' });
    });

    // Authentication routes with validation
    router.post('/register', validateRegister, registerUser);
    router.post('/login', validateLogin, loginUser);
    router.post('/verify-otp', validateVerifyOtp, verifyOTP);
    router.post('/resend-otp', validateResendOtp, resendOTP);
    router.post('/refresh-token', validateRefreshToken, refreshToken);
    router.post('/forgot-password', validateForgotPassword, forgotPassword);


    router.post("/create-products", createProduct);
    router.get("/products/:id", getProductById);
    router.get("/products", getProductsPerPage);
    // Protected routes (authentication required)
    router.use(auth); // Apply auth middleware to all routes below
    router.use(delay); // Apply delay middleware

    // User management routes with validation
    router.get('/profile', getUserProfile);

    return app.use('/v1/api/', router);
};

module.exports = initApiRoutes;