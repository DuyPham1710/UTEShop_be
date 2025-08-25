const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/user.js');
const OTPService = require('../otp/otpService.js');

class AuthService {
    static async registerUser(userData) {
        try {
            const existingUser = await User.findOne({
                $or: [
                    { email: userData.email },
                    { username: userData.username }
                ]
            });

            if (existingUser) {
                return {
                    success: false,
                    message: existingUser.email === userData.email
                        ? 'Email already exists'
                        : 'Username already exists'
                };
            }

            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            // Generate OTP
            const otp = await OTPService.sendOTP(userData.email, userData.fullName);

            const newUser = new User({
                ...userData,
                password: hashedPassword,
                otp: otp,
                otpGeneratedTime: new Date(),
                isActive: false
            });

            await newUser.save();

            // Remove password and OTP from response
            const userResponse = newUser.toObject();
            delete userResponse.password;
            delete userResponse.otp;
            delete userResponse.otpGeneratedTime;

            return {
                success: true,
                message: 'User registered successfully. please check mail and verify account within 5 minute.',
                data: userResponse
            };
        } catch (error) {
            console.error('Error registering user:', error);
            return {
                success: false,
                message: 'Error registering user'
            };
        }
    }

    // Login user
    static async loginUser(credentials) {
        try {
            // Find user by username or email
            const user = await User.findOne({
                $or: [
                    { username: credentials.username },
                    { email: credentials.username }
                ]
            });

            if (!user) {
                return {
                    success: false,
                    message: 'Invalid credentials'
                };
            }

            if (!user.isActive) {
                return {
                    success: false,
                    message: 'Account not activated. Please verify OTP first.'
                };
            }

            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: 'Invalid credentials'
                };
            }

            // Generate JWT tokens
            const accessToken = jwt.sign(
                {
                    userId: user._id,
                    username: user.username,
                    email: user.email
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
            );

            const refreshToken = jwt.sign(
                {
                    userId: user._id,
                    type: 'refresh'
                },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
            );

            // Save refresh token to user
            user.refreshToken = refreshToken;
            await user.save();

            const userResponse = user.toObject();
            delete userResponse.password;
            delete userResponse.otp;
            delete userResponse.otpGeneratedTime;
            delete userResponse.refreshToken;

            return {
                success: true,
                message: 'Login successful',
                data: {
                    user: userResponse,
                    accessToken,
                    refreshToken
                }
            };
        } catch (error) {
            console.error('Error logging in user:', error);
            return {
                success: false,
                message: 'Error logging in user'
            };
        }
    }

    // Refresh access token
    static async refreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            if (decoded.type !== 'refresh') {
                return {
                    success: false,
                    message: 'Invalid refresh token'
                };
            }

            const user = await User.findById(decoded.userId);
            if (!user || user.refreshToken !== refreshToken) {
                return {
                    success: false,
                    message: 'Invalid refresh token'
                };
            }

            // Generate new access token
            const newAccessToken = jwt.sign(
                {
                    userId: user._id,
                    username: user.username,
                    email: user.email
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
            );

            return {
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken: newAccessToken
                }
            };
        } catch (error) {
            console.error('Error refreshing token:', error);
            return {
                success: false,
                message: 'Error refreshing token'
            };
        }
    }

    // Change user password
    static async changePassword(email, newPassword) {
        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            user.password = hashedPassword;
            await user.save();
            return {
                success: true,
                message: 'Password changed successfully'
            };
        } catch (error) {
            console.error('Error changing password:', error);
            return {
                success: false,
                message: 'Error changing password'
            };
        }
    }
}

module.exports = AuthService;
