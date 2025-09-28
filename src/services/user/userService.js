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

            // return {
            //     success: true,
            //     message: 'Profile updated successfully',
            //     data: updatedUser
            // };
            return updatedUser;
        } catch (error) {
            console.error('Error updating user profile:', error);
            return {
                success: false,
                message: 'Error updating user profile'
            };
        }
    }

    static async addToViewedProducts(userId, productId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            // Kiểm tra nếu sản phẩm chưa được xem
            if (!user.viewedProducts.includes(productId)) {
                // Thêm vào danh sách đã xem
                user.viewedProducts.push(productId);
                await user.save();
            }

            return {
                success: true,
                message: 'Added to viewed products successfully'
            };
        } catch (error) {
            console.error('Error adding to viewed products:', error);
            return {
                success: false,
                message: 'Error adding to viewed products'
            };
        }
    }

    static async toggleFavoriteProduct(userId, productId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            const productIndex = user.favProducts.indexOf(productId);
            
            if (productIndex === -1) {
                // Nếu chưa có trong danh sách yêu thích thì thêm vào
                user.favProducts.push(productId);
                await user.save();
                return {
                    success: true,
                    message: 'Added to favorites successfully',
                    isFavorited: true
                };
            } else {
                // Nếu đã có trong danh sách yêu thích thì xóa đi
                user.favProducts.splice(productIndex, 1);
                await user.save();
                return {
                    success: true,
                    message: 'Removed from favorites successfully',
                    isFavorited: false
                };
            }
        } catch (error) {
            console.error('Error toggling favorite product:', error);
            return {
                success: false,
                message: 'Error updating favorite products'
            };
        }
    }

    static async getNewUsersStats({ from, to, groupBy = "day" }) {
        const fromDate = from ? new Date(from) : new Date("1970-01-01");
        const toDate = to ? new Date(to) : new Date();

        let dateFormat;
        if (groupBy === "day") {
            dateFormat = "%Y-%m-%d";
        } else if (groupBy === "month") {
            dateFormat = "%Y-%m";
        } else {
            throw new Error("Invalid groupBy. Use 'day' or 'month'.");
        }

        const stats = await User.aggregate([
            {
            $match: {
                createdAt: { $gte: fromDate, $lte: toDate },
            },
            },
            {
            $group: {
                _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                newUsers: { $sum: 1 },
            },
            },
            { $sort: { _id: 1 } },
        ]);

        return stats.map((s) => ({
            date: s._id,
            users: s.newUsers,
        }));
    }

}

export default UserService;