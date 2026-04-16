const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const mongoose = require("mongoose"); 

require("dotenv").config({ path: path.join(__dirname, ".env") });

mongoose.set("debug", false);
mongoose.set("strictQuery", true);

const connectDB = require("./config/db");

const app = express();
app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
});

io.on("disconnect", (socket) => {
});

app.set("io", io);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/registrations", require("./routes/registrations"));
app.use("/api/notifications", require("./routes/notifications"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`✅ Socket.io Server Ready`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  });

const Notification = require("./models/Notification");
const Event = require("./models/Event");
const Registration = require("./models/Registration");

const runNotificationScheduler = async () => {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const upcomingEvents = await Event.find({
      date: { $gte: now, $lte: in24Hours }
    }).populate("registrations");

    for (const event of upcomingEvents) {
      if (event.registrations && event.registrations.length > 0) {
        for (const reg of event.registrations) {
          const existingNotif = await Notification.findOne({
            user: reg.user,
            event: event._id,
            message: { $regex: "starting soon" }
          });
          if (!existingNotif) {
            await Notification.create({
              user: reg.user,
              event: event._id,
              message: `Reminder: "${event.title}" is starting soon!`
            });
          }
        }
      }
    }

    const eventsWithDeadline = await Event.find({
      date: { $gt: in3Days, $lte: new Date(in3Days.getTime() + 60 * 60 * 1000) }
    });

    for (const event of eventsWithDeadline) {
      const registrations = await Registration.find({ event: event._id });
      for (const reg of registrations) {
        const existingNotif = await Notification.findOne({
          user: reg.user,
          event: event._id,
          message: { $regex: "register" }
        });
        if (!existingNotif) {
          await Notification.create({
            user: reg.user,
            event: event._id,
            message: `Don't forget! Registration for "${event.title}" closes in 3 days.`
          });
        }
      }
    }
  } catch (err) {
    console.error("Notification scheduler error:", err.message);
  }
};

setInterval(runNotificationScheduler, 30 * 60 * 1000);
setTimeout(runNotificationScheduler, 10000);

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});