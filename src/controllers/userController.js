const UserService = require('../services/user/userService.js');

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await UserService.getUserProfile(userId);

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(404).json(result);
        }
    } catch (error) {
        console.error('Error in getUserProfile controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getUserProfile
};      
