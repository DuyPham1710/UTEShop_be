const dotenv = require('dotenv');
const Product = require('../../models/products.js');

dotenv.config();

const createProductService = async (productData) => {
    try {
        let result;
        // Nếu productData là mảng -> insertMany
        if (Array.isArray(productData)) {
            const newProducts = await Product.insertMany(productData);
            result = { success: true, message: "Products created successfully", products: newProducts };
        } else {
            // Nếu là object -> create 1 product
            const newProduct = new Product(productData);
            await newProduct.save();
            result = { success: true, message: "Product created successfully", product: newProduct };
        }

        return result;
    } catch (error) {
        console.error("Error creating product(s):", error);
        return { success: false, message: "Error creating product(s)" };
    }
};


const getProductByIdService = async (productId) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return { success: false, message: "Product not found" };
        }
        return { success: true, product };
    } catch (error) {
        console.error("Error fetching product:", error);
        return { success: false, message: "Error fetching product" };
    }
};

const getProductPerPageService = async (page = 1, limit = 5, category) => {
    try {
        const skip = (page - 1) * limit;

        // nếu có category thì filter
        const filter = category ? { category } : {};

        const products = await Product.find(filter)
            .skip(skip)
            .limit(limit)
            .lean();

        const totalProducts = await Product.countDocuments(filter);

        return {
            success: true,
            data: products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts
            }
        };
    } catch (error) {
        console.error("Error fetching products:", error);
        return { success: false, message: "Error fetching products" };
    }
    
};

const getAllCategoriesService = async () => {
  try {
    const categories = await Product.distinct("category");
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, message: "Error fetching categories" };
  }
};

module.exports = {
    createProductService,
    getProductByIdService,
    getProductPerPageService,
    getAllCategoriesService
};