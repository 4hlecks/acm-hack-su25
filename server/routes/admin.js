const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const User = require("../models/users_schema");

// Get current admin profile
router.get("/profile/me", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can access this" });
    }

    const admin = await User.findById(req.user.id).select("name email role profilePic updatedAt");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json({ admin });
  } catch (err) {
    console.error("Get admin profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update admin profile (name + profilePic)
router.put("/profile/update", auth, upload.single("profilePic"), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update profile" });
    }

    const { name, removePic } = req.body;
    const updateData = {};

    if (name) updateData.name = name.trim();

    if (req.file) {
      // Multer: local = file.path, Cloudinary = file.secure_url
      updateData.profilePic = req.file.secure_url || req.file.path;
    } else if (removePic === "true") {
      updateData.profilePic = ""; // clear pic
    }

    const updatedAdmin = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) return res.status(404).json({ message: "Admin not found" });

    res.json({
      message: "Profile updated successfully",
      admin: {
        id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        profilePic: updatedAdmin.profilePic,
        updatedAt: updatedAdmin.updatedAt,
      },
    });
  } catch (err) {
    console.error("Update admin profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
