import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Room from "./models/Room.js";
const rooms = [
  { name: "Deluxe King Room", type: "Deluxe", description: "A calm, sunlit room with a king bed and elegant details.", pricePerNight: 4200, capacity: 2, amenities: ["Wi-Fi", "Breakfast", "Air conditioning"], imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80" },
  { name: "Premium Twin Room", type: "Premium", description: "Thoughtful comforts and room to unwind after a busy day.", pricePerNight: 3500, capacity: 2, amenities: ["Wi-Fi", "Workspace", "Air conditioning"], imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80" },
  { name: "Executive Suite", type: "Suite", description: "A spacious suite made for a little extra indulgence.", pricePerNight: 7800, capacity: 3, amenities: ["Wi-Fi", "Breakfast", "Living area"], imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80" },
  { name: "Family Comfort Room", type: "Family", description: "Extra space for families and small groups.", pricePerNight: 5600, capacity: 4, amenities: ["Wi-Fi", "Breakfast", "Extra beds"], imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80" }
];
try {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const room of rooms) await Room.updateOne({ name: room.name }, { $set: room }, { upsert: true });
  console.log("Demo rooms added/updated.");
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
