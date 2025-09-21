const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const adminAuth = require("../../middleware/adminAuth");
const User = require("../../models/users_schema");

// Require admin
router.use(auth, adminAuth);

// GET /api/admin/account-requests?status=pending|approved
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const where = { role: "club" };

    if (status === "pending") where.approved = false;
    if (status === "approved") where.approved = true;

    const clubs = await User.find(where).select("name email role approved profilePic");
    res.json({ items: clubs });
  } catch (err) {
    console.error("Error fetching account requests:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/account-requests/:id/approve
router.post("/:id/approve", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    ).select("name email role approved");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Club approved", user });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/account-requests/:id/deny
router.post("/:id/deny", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Club denied and removed" });
  } catch (err) {
    console.error("Deny error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/account-requests/metrics
router.get("/metrics", async (req, res) => {
    try {
      const accountsInReview = await User.countDocuments({ role: "club", approved: false });
      const approvedClubs = await User.countDocuments({ role: "club", approved: true });
  
      // For now, hardcode bugs/reports until you track them in DB
      const bugs = 0;
      const reports = 0;
  
      res.json({ accountsInReview, approvedClubs, bugs, reports });
    } catch (err) {
      console.error("Metrics error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = router;
