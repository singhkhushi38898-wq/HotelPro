import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  pricePerNight: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true, min: 1, default: 2 },
  imageUrl: { type: String, default: "" },
  amenities: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model("Room", schema);
