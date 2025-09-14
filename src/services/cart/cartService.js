import Cart from "../../models/cart.js";
import product from "../../models/product.js";
import Product from "../../models/product.js";

class CartService {
    // Lấy giỏ hàng theo user ID
    async getCartByUserId(userId) {
        return await Cart.findOne({ user: userId });
    }

    // Thêm sản phẩm vào giỏ hàng
    async addToCart(userId, productId, quantity) {
        let cart = await Cart.findOne({ user: userId });

        // Nếu chưa có giỏ hàng, tạo mới
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: []
            });
        }

        // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        const product = await Product.findById(productId);
        if (!product) {
            throw new Error("Sản phẩm không tồn tại");
        }

        if (existingItemIndex > -1) {
            // Nếu đã có, cộng thêm số lượng
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            if (newQuantity > product.quantity) {
                throw new Error(`Chỉ còn ${product.quantity} sản phẩm trong kho`);
            }
            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Nếu chưa có, thêm mới
            cart.items.push({
                product: productId,
                quantity: quantity
            });
        }

        await cart.save();
        return cart;
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    async updateCartItem(userId, productId, quantity) {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            throw new Error("Giỏ hàng không tồn tại");
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            throw new Error("Sản phẩm không có trong giỏ hàng");
        }

        const product = await Product.findById(productId);
        if (!product) {
            throw new Error("Sản phẩm không tồn tại");
        }

        const newQuantity = cart.items[itemIndex].quantity + quantity;
        if (newQuantity > product.quantity) {
            throw new Error(`Chỉ còn ${product.quantity} sản phẩm trong kho`);
        }
        cart.items[itemIndex].quantity = newQuantity;
        await cart.save();

        return cart;
    }

    // Xóa sản phẩm khỏi giỏ hàng
    async removeFromCart(userId, productId) {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            throw new Error("Giỏ hàng không tồn tại");
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();
        return cart;
    }

    // Xóa toàn bộ giỏ hàng
    async clearCart(userId) {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            throw new Error("Giỏ hàng không tồn tại");
        }

        cart.items = [];
        await cart.save();
        return cart;
    }

    // Lấy số lượng sản phẩm trong giỏ hàng
    async getCartItemCount(userId) {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return 0;
        }

        return cart.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Kiểm tra sản phẩm có trong giỏ hàng không
    async isProductInCart(userId, productId) {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return false;
        }

        return cart.items.some(item => item.product.toString() === productId);
    }

    // Lấy thông tin chi tiết giỏ hàng với populate
    async getCartWithDetails(userId) {
        const cart = await Cart.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name price discount images stock'
        });

        if (!cart) {
            return null;
        }

        // Tính tổng tiền và số lượng
        let totalItems = 0;
        let totalPrice = 0;
        let originalPrice = 0;

        cart.items.forEach(item => {
            if (item.product) {
                totalItems += item.quantity;
                const itemOriginalPrice = item.product.price * item.quantity;
                const itemDiscountedPrice = itemOriginalPrice * (1 - (item.product.discount || 0) / 100);

                originalPrice += itemOriginalPrice;
                totalPrice += itemDiscountedPrice;
            }
        });

        return {
            ...cart.toObject(),
            totalItems,
            totalPrice: Math.round(totalPrice),
            originalPrice: Math.round(originalPrice),
            totalDiscount: Math.round(originalPrice - totalPrice)
        };
    }
}

export const cartService = new CartService();
