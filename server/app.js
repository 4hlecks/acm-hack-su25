const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const usersRouter = require("./routes/users.js");
const eventsRouter = require("./routes/event_router/event_router");
const clubsRouter = require("./routes/club_router/club_router");
const adminEventsRouter = require("./routes/admin/admin_event_router.js");
const adminUsersRouter = require("./routes/admin/admin_users_router.js");
const adminAccountRequestsRouter = require("./routes/admin/admin_account_requests_router.js");
const requireAuth = require("./middleware/auth");
const adminMetrics = require("./routes/admin/metrics_router");
const searchRouter = require("./routes/search_router/search_router");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true, 
  },
});

let maintenanceMode = false;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/maintenance", (req, res, next) => {
  if (req.method === "POST") {
    const { enabled } = req.body;
    if (typeof enabled === "boolean") {
      maintenanceMode = enabled;
      console.log("Broadcasting maintenance mode:", maintenanceMode);
      io.emit("maintenance-update", { enabled: maintenanceMode });
    }
    return res.json({ enabled: maintenanceMode });
  }

  if (req.method === "GET") {
    return res.json({ enabled: maintenanceMode });
  }

  next();
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.emit("maintenance-update", { enabled: maintenanceMode });
});


const FRONTEND_ORIGINS = [
  process.env.FRONTEND_ORIGIN || "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) =>
      cb(null, FRONTEND_ORIGINS.includes(origin) || !origin),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(logger("dev"));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/__ping", (_req, res) => res.json({ ok: true }));
app.get("/api/me", requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user });
});

app.use("/auth", authRoutes);
app.use("/users", usersRouter);
app.use("/api/loadEvents", eventsRouter);
app.use("/api/admin/events", adminEventsRouter);
app.use("/api/admin/users", adminUsersRouter);
app.use("/api/admin/account-requests", adminAccountRequestsRouter);
app.use("/api/findClub", clubsRouter);
app.use("/api/search", searchRouter);
app.use("/api/admin/metrics", adminMetrics);

app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.DB_URL).then(() => {
  console.log("Connected to MongoDB database");
});

module.exports = { app, server };
