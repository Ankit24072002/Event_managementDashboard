const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Name, email and password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({ token, role: user.role, name: user.name, id: user._id.toString() });
  } catch (err) {
    res.status(500).json({ msg: "Registration failed", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ msg: "Wrong password" });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({ token, role: user.role, name: user.name, id: user._id.toString() });
  } catch (err) {
    res.status(500).json({ msg: "Login failed", error: err.message });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true }
    ).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Failed to update profile", error: err.message });
  }
});

module.exports = router;
