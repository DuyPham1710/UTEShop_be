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
    // const userId = req.user._id;
    const userId = req.user.userId;

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

export const addToViewedProducts = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        const result = await UserService.addToViewedProducts(userId, productId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in addToViewedProducts controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const toggleFavoriteProduct = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        const result = await UserService.toggleFavoriteProduct(userId, productId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in toggleFavoriteProduct controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        // Validate input
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 5));
        const keyword = req.query.keyword?.trim() || "";

        const result = await UserService.getAllUsers({ page, limit, keyword });

        return res.status(200).json(result);
    } catch (error) {
        console.error("❌ Error in getAllUsers controller:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};



