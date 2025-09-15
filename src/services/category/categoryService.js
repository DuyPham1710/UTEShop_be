import slugify from "slugify";
import  Category from "../../models/category.js";

export const categoryService = {
  async createCategory(data) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const category = new Category({ ...data, slug });
    return await category.save();
  },

  async getCategories() {
    return await Category.find({}, "name description slug");
  },

  async getCategoryById(id) {
    return await Category.findById(id);
  },

  async getCategoryBySlugId(id) {
    return await Category.findById(id);
  },
};
