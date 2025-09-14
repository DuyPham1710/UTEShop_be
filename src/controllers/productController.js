const { createProductService, getProductByIdService, getProductPerPageService} = require("../services/product/productService");

class ProductController {
    static async createProduct(req, res) {
        const productData = req.body;
        const result = await createProductService(productData);
        if (result.success) {
            return res.status(201).json(result);
        } else {
            return res.status(500).json(result);
        }
    }

    static async getProductById(req, res) {
        const { id } = req.params;
        const result = await getProductByIdService(id);
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(404).json(result);
        }
    }

    static async getProductsPerPage(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const result = await getProductPerPageService(page, limit);
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json(result);
        }
    }
}
module.exports = ProductController;