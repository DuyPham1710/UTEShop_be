import mongoose from "mongoose";

const { Schema } = mongoose;

const userVoucherSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }, // khách hàng được gán voucher

  voucherId: { 
    type: Schema.Types.ObjectId, 
    ref: "Voucher", 
    required: true 
  }, // voucher áp dụng

  usedCount: { 
    type: Number, 
    default: 0 
  }, // số lần user đã dùng

  maxUsagePerUser: { 
    type: Number, 
    default: 1 
  }, // số lần tối đa user được dùng voucher này

  assignedDate: { 
    type: Date, 
    default: Date.now 
  }, // ngày gán voucher cho user

});

export default mongoose.model("UserVoucher", userVoucherSchema, "userVouchers");
