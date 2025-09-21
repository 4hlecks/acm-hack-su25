// server/routes/admin/metrics_router.js
const express = require("express");
const router = express.Router();
const User = require("../../models/users_schema");

// require admin
const auth = require("../../middleware/auth");
const adminAuth = require("../../middleware/adminAuth");
router.use(auth, adminAuth);

// GET /api/admin/metrics
router.get("/", async (req, res) => {
  try {
    const accountsInReview = await User.countDocuments({ role: "club", approved: false });
    const bugs = 0;     // replace later with real bug tracking
    const reports = 0;  // replace later with real reports

    res.json({ accountsInReview, bugs, reports });
  } catch (err) {
    console.error("Metrics error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
