import mongoose from "mongoose";

const { Schema } = mongoose;

const deliveryAddressSchema = new Schema({
    addressName: { type: String, required: true },
    defaultAddress: { type: Boolean, default: false },
    nameBuyer: { type: String, required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    phoneNumber: { type: String },
    note: { type: String }
}, { timestamps: true });

export default mongoose.model("DeliveryAddress", deliveryAddressSchema, "delivery_addresses");
