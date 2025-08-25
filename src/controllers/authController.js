const AuthService = require('../services/auth/authService.js');
const OTPService = require('../services/otp/otpService.js');

const registerUser = async (req, res) => {
    try {
        const { fullName, phoneNumber, gender, dateOfBirth, avt, email, username, password } = req.body;

        // Validation
        if (!fullName || !email || !username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: fullName, email, username, password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const userData = {
            fullName,
            phoneNumber,
            gender,
            dateOfBirth,
            avt,
            email,
            username,
            password
        };

        const result = await AuthService.registerUser(userData);

        if (result.success) {
            return res.status(201).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in registerUser controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const result = await AuthService.loginUser({ username, password });

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(401).json(result);
        }
    } catch (error) {
        console.error('Error in loginUser controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validation
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const result = await OTPService.verifyOTP(email, otp);

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in verifyOTP controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Forgot password
const forgotPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        const isOTPValid = await OTPService.verifyOTP(email, otp);
        if (!isOTPValid.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }
        const result = await AuthService.changePassword(email, newPassword);

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in forgotPassword controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Resend OTP
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const result = await OTPService.resendOTP(email);

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in resendOTP controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Refresh token
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        // Validation
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        const result = await AuthService.refreshToken(refreshToken);

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(401).json(result);
        }
    } catch (error) {
        console.error('Error in refreshToken controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


module.exports = {
    registerUser,
    loginUser,
    verifyOTP,
    resendOTP,
    refreshToken,
    forgotPassword
};
