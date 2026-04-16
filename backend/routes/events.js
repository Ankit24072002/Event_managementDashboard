const router = require("express").Router();
const mongoose = require("mongoose");

const Event = require("../models/Event");
const User = require("../models/User");
const Registration = require("../models/Registration");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

// ================= GET ALL EVENTS =================
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name email");

    const shaped = events.map((event) => ({
      ...event.toObject(),
      registrationsCount: event.registrations.length,
    }));

    res.json(shaped);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= ANALYTICS =================
router.get("/analytics", auth, async (req, res) => {
  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({ msg: "Only organizers can view analytics" });
    }

    const events = await Event.find({ createdBy: req.user.id });

    const eventsWithCount = events.map((event) => ({
      ...event.toObject(),
      registrationsCount: event.registrations.length,
    }));

    const totalEvents = events.length;
    const totalRegistrations = events.reduce(
      (sum, e) => sum + e.registrations.length,
      0
    );

    const totalCapacity = events.reduce(
      (sum, e) => sum + (e.capacity || 0),
      0
    );

    const avgRegistrations =
      totalEvents > 0 ? totalRegistrations / totalEvents : 0;

    res.json({
      totalEvents,
      totalRegistrations,
      totalCapacity,
      avgRegistrations,
      events: eventsWithCount,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= GET SINGLE EVENT =================
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid Event ID" });
    }

    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate({
        path: "registrations",
        populate: { path: "user", select: "name email" },
      });

    if (!event) return res.status(404).json({ msg: "Event not found" });

    res.json({
      ...event.toObject(),
      registrationsCount: event.registrations.length,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= CREATE EVENT =================
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({ msg: "Only organizers can create events" });
    }

    const { title, description, date, location, capacity } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      location,
      capacity,
      createdBy: req.user.id,
    });

    const users = await User.find({ role: "user" }).select("_id");

    if (users.length > 0) {
      const notifications = users.map((user) => ({
        user: user._id,
        event: event._id,
        message: `New event created: ${event.title}`,
      }));

      await Notification.insertMany(notifications);
    }

    res.json({ ...event.toObject(), registrationsCount: 0 });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= UPDATE EVENT =================
router.put("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ msg: "Event not found" });

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not allowed" });
    }

    const updates = ["title", "description", "date", "location", "capacity"]
      .reduce((acc, key) => {
        if (req.body[key] !== undefined) acc[key] = req.body[key];
        return acc;
      }, {});

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= DELETE EVENT =================
router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ msg: "Event not found" });

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not allowed" });
    }

    await event.deleteOne();

    res.json({ msg: "Event deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= REGISTER EVENT (FIXED) =================
router.post("/:id/register", auth, async (req, res) => {
  try {
    // ✅ CRITICAL FIX
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid Event ID" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    if (event.capacity && event.registrations.length >= event.capacity) {
      return res.status(400).json({ msg: "Event is full" });
    }

    const existing = await Registration.findOne({
      user: req.user.id,
      event: event._id,
    });

    if (existing) {
      return res.status(400).json({ msg: "Already registered" });
    }

    const registration = await Registration.create({
      user: req.user.id,
      event: event._id,
    });

    event.registrations.push(registration._id);
    await event.save();

    await Notification.create({
      user: event.createdBy,
      event: event._id,
      message: `${req.user.name || "User"} registered for ${event.title}`,
    });

    res.json({
      msg: "Registered successfully",
      registration,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= GET REGISTRATIONS =================
router.get("/:id/registrations", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate({
      path: "registrations",
      populate: { path: "user", select: "name email" },
    });

    if (!event) return res.status(404).json({ msg: "Event not found" });

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not allowed" });
    }

    res.json(event.registrations);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;