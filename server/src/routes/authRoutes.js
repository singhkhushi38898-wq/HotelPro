import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
const router = Router();
const makeToken = user => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8)
      return res.status(400).json({ message: "Name, email and password (at least 8 characters) are required." });
    const cleanEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: cleanEmail })) return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name: name.trim(), email: cleanEmail, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: makeToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
});
router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password)))
      return res.status(401).json({ message: "Email or password is incorrect." });
    res.json({ token: makeToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
});
router.get("/me", protect, (req, res) => res.json({ user: req.user }));
export default router;
