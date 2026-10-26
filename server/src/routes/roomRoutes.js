import { Router } from "express";
import Room from "../models/Room.js";
import { protect, adminOnly } from "../middleware/auth.js";
const router = Router();
router.get("/", async (_req, res, next) => {
  try { res.json(await Room.find({ isActive: true }).sort({ createdAt: -1 })); } catch (err) { next(err); }
});
router.get("/:id", async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || !room.isActive) return res.status(404).json({ message: "Room not found." });
    res.json(room);
  } catch (err) { next(err); }
});
router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { name, type, pricePerNight, capacity } = req.body;
    if (!name || !type || !Number.isFinite(Number(pricePerNight)) || Number(pricePerNight) < 0 || !Number.isFinite(Number(capacity)) || Number(capacity) < 1)
      return res.status(400).json({ message: "Valid name, type, price and capacity are required." });
    res.status(201).json(await Room.create(req.body));
  } catch (err) { next(err); }
});
router.put("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ message: "Room not found." });
    res.json(room);
  } catch (err) { next(err); }
});
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found." });
    res.json({ message: "Room removed." });
  } catch (err) { next(err); }
});
export default router;
