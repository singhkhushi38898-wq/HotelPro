import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "HotelPro API" }));
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});
const port = process.env.PORT || 5000;
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing. Copy .env.example to .env and configure it.");
  process.exit(1);
}
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(port, () => console.log(`HotelPro API running at http://localhost:${port}`));
  })
  .catch(error => { console.error("MongoDB connection failed:", error.message); process.exit(1); });
