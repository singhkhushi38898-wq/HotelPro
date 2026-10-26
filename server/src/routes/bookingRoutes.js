import { Router } from "express";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import { protect } from "../middleware/auth.js";
const router = Router();
router.post("/", protect, async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut, guests, paymentMethod = "hotel" } = req.body;
    const start = new Date(checkIn), end = new Date(checkOut), guestCount = Number(guests);
    if (!roomId || !checkIn || !checkOut || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start || !Number.isInteger(guestCount) || guestCount < 1)
      return res.status(400).json({ message: "Please provide a room, valid dates and at least one guest." });
    if (!["upi", "card", "hotel"].includes(paymentMethod))
      return res.status(400).json({ message: "Please choose a valid payment method." });
    const room = await Room.findOne({ _id: roomId, isActive: true });
    if (!room) return res.status(404).json({ message: "Room not found." });
    if (guestCount > room.capacity) return res.status(400).json({ message: `This room allows up to ${room.capacity} guests.` });
    const conflict = await Booking.findOne({ room: roomId, status: "confirmed", checkIn: { $lt: end }, checkOut: { $gt: start } });
    if (conflict) return res.status(409).json({ message: "This room is already booked for those dates." });
    const nights = Math.ceil((end - start) / 86400000);
    const booking = await Booking.create({ user: req.user._id, room: roomId, checkIn: start, checkOut: end, guests: guestCount, totalPrice: nights * room.pricePerNight, paymentMethod, paymentStatus: paymentMethod === "hotel" ? "pending" : "demo" });
    res.status(201).json(await booking.populate("room"));
  } catch (err) { next(err); }
});
router.get("/my", protect, async (req, res, next) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };
    res.json(await Booking.find(filter).populate("room").populate("user", "name email").sort({ createdAt: -1 }));
  } catch (err) { next(err); }
});
router.patch("/:id/cancel", protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") return res.status(403).json({ message: "You cannot cancel this booking." });
    if (booking.status === "cancelled") return res.status(400).json({ message: "Booking is already cancelled." });
    booking.status = "cancelled"; await booking.save(); res.json(booking);
  } catch (err) { next(err); }
});
export default router;
