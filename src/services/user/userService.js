// const bcrypt = require('bcrypt');
import User from '../../models/user.js';
class UserService {
    static async getUserProfile(userId) {
        try {
            const user = await User.findById(userId).select('-password -otp -otpGeneratedTime -refreshToken');

            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            return {
                success: true,
                data: user
            };
        } catch (error) {
            console.error('Error getting user profile:', error);
            return {
                success: false,
                message: 'Error getting user profile'
            };
        }
    }

    static async updateUserProfile(userId, updateData) {
        try {
            const allowedFields = ["fullName", "phoneNumber", "gender", "dateOfBirth", "avt"];
            const filteredData = {};

            for (const key of allowedFields) {
                if (updateData[key] !== undefined) {
                    filteredData[key] = updateData[key];
                }
            }

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: filteredData },
                { new: true, runValidators: true }
            ).select('-password -otp -otpGeneratedTime -refreshToken');

            if (!updatedUser) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            return {
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser
            };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return {
                success: false,
                message: 'Error updating user profile'
            };
        }
    }
}

export default UserService;