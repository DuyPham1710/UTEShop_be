import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String },
  gender: { type: Boolean, default: false },
  dateOfBirth: { type: Date },
  avt: { type: String },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  otp: { type: String },
  otpGeneratedTime: { type: Date, default: Date.now },
  refreshToken: { type: String },
  xu: { type: Number, default: 0 },

  
  viewedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product"}],
  favProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product"}]
});

// Xuất model theo ESM
export default mongoose.model("User", userSchema, "users");
