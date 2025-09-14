import Cart from "../models/cart.js";
import Product from "../models/product.js";
import { cartService } from "../services/cart/cartService.js";

// Lấy giỏ hàng của user
export const getCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const cart = await cartService.getCartByUserId(userId);

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Giỏ hàng trống",
                data: {
                    items: [],
                    totalItems: 0,
                    totalPrice: 0
                }
            });
        }

        // Populate thông tin sản phẩm
        await cart.populate({
            path: 'items.product',
            select: 'name price discount images',
            populate: {
                path: "images", // populate từ ProductImage
                select: "url alt"
            }
        });

        // Tính tổng tiền và số lượng
        let totalItems = 0;
        let totalPrice = 0;

        cart.items.forEach(item => {
            if (item.product) {
                totalItems += item.quantity;
                const itemPrice = item.product.price * (1 - (item.product.discount || 0) / 100);
                totalPrice += itemPrice * item.quantity;
            }
        });

        res.status(200).json({
            success: true,
            message: "Lấy giỏ hàng thành công",
            data: {
                items: cart.items,
                totalItems,
                totalPrice: Math.round(totalPrice)
            }
        });
    } catch (error) {
        console.error("Error getting cart:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy giỏ hàng",
            error: error.message
        });
    }
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        const { productId, quantity = 1 } = req.body;

        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Sản phẩm không tồn tại"
            });
        }

        // Kiểm tra số lượng có đủ không
        if (product.quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: `Chỉ còn ${product.quantity} sản phẩm trong kho`
            });
        }

        const result = await cartService.addToCart(userId, productId, quantity);

        res.status(200).json({
            success: true,
            message: "Thêm vào giỏ hàng thành công",
            data: result
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi thêm vào giỏ hàng",
            error: error.message
        });
    }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId, quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Số lượng phải lớn hơn 0"
            });
        }

        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Sản phẩm không tồn tại"
            });
        }

        // Kiểm tra số lượng có đủ không
        if (product.quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: `Chỉ còn ${product.quantity} sản phẩm trong kho`
            });
        }

        const result = await cartService.updateCartItem(userId, productId, quantity);

        res.status(200).json({
            success: true,
            message: "Cập nhật giỏ hàng thành công",
            data: result
        });
    } catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật giỏ hàng",
            error: error.message
        });
    }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;

        const result = await cartService.removeFromCart(userId, productId);

        res.status(200).json({
            success: true,
            message: "Xóa sản phẩm khỏi giỏ hàng thành công",
            data: result
        });
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa khỏi giỏ hàng",
            error: error.message
        });
    }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        await cartService.clearCart(userId);

        res.status(200).json({
            success: true,
            message: "Xóa toàn bộ giỏ hàng thành công"
        });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa giỏ hàng",
            error: error.message
        });
    }
};

// Lấy số lượng sản phẩm trong giỏ hàng
export const getCartCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const count = await cartService.getCartItemCount(userId);

        res.status(200).json({
            success: true,
            message: "Lấy số lượng giỏ hàng thành công",
            data: { count }
        });
    } catch (error) {
        console.error("Error getting cart count:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy số lượng giỏ hàng",
            error: error.message
        });
    }
};
