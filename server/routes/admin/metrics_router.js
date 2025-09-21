const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const adminAuth = require("../../middleware/adminAuth");
const User = require("../../models/users_schema");
const Event = require("../../models/event_schema");

// Protect all /api/admin/metrics routes
router.use(auth, adminAuth);

// GET /api/admin/metrics
router.get("/", async (req, res) => {
  try {
    const accountsInReview = await User.countDocuments({ role: "club", approved: false });

    // replace w/ real values once bugs & reports implemented
    const bugs = 0;
    const reports = 0;

    res.json({
      accountsInReview,
      bugs,
      reports,
    });
  } catch (err) {
    console.error("Error fetching metrics:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
