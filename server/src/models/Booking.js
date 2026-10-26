import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ["upi", "card", "hotel"], default: "hotel" },
  paymentStatus: { type: String, enum: ["pending", "demo"], default: "pending" },
  status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" }
}, { timestamps: true });
export default mongoose.model("Booking", schema);
