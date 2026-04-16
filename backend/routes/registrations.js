const router = require("express").Router();
const auth = require("../middleware/auth");
const Registration = require("../models/Registration");

router.get("/mine", auth, async (req, res) => {
  const registrations = await Registration.find({ user: req.user.id })
    .populate({ path: "event", populate: { path: "createdBy", select: "name" } });
  res.json(registrations);
});

router.get("/event/:id", auth, async (req, res) => {
  const registrations = await Registration.find({ event: req.params.id })
    .populate("user", "name email");
  res.json(registrations);
});

module.exports = router;
