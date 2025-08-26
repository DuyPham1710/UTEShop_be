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
}

export default UserService;