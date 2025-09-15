import { categoryService } from "../services/category/categoryService.js";

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
