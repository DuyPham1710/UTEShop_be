import UserService from '../services/user/userService.js';

export const getUserProfile = async (req, res) => {
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

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updatedUser = await UserService.updateUserProfile(userId, req.body);
    console.log(userId)
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};
