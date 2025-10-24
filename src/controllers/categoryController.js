import { categoryService } from "../services/category/categoryService.js";
import slugify from "slugify";
import Category from "../models/category.js";

export const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Thiếu tên danh mục" });
    }

    // Tạo slug tiếng Việt không dấu
    const slug = slugify(name, { lower: true, locale: "vi" });

    // Kiểm tra trùng slug hoặc tên
    const exists = await Category.findOne({ $or: [{ name }, { slug }] });
    if (exists) {
      return res.status(400).json({ success: false, message: "Danh mục đã tồn tại" });
    }

    const category = new Category({
      name,
      description,
      slug,
    });
    await category.save();

    res.status(201).json({ success: true, message: "Thêm danh mục thành công", data: category });
  } catch (err) {
    console.error("Error addCategory:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const categoryController = {
  async create(req, res) {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json(category);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async list(req, res) {
    try {
      const categories = await categoryService.getCategories();
      res.json(categories);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async detail(req, res) {
    try {
      const { id } = req.params; // lấy phần sau dấu "-" trong slug-id
      const category = await categoryService.getCategoryById(id);
      if (!category) return res.status(404).json({ error: "Not found" });
      res.json(category);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
