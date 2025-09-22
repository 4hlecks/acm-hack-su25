// routes/admin/admin_users_router.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');
const User = require('../../models/users_schema');

const bcrypt = require("bcrypt");
const upload = require("../../middleware/upload");

// All admin user routes require auth + admin
router.use(auth, adminAuth);

/**
 * GET /api/admin/users
 * List users (defaults to approved clubs for owner dropdown).
 *
 * Query params (all optional):
 *  - role: 'club' | 'user' | 'admin'  (default 'club')
 *  - approved: 'true' | 'false'       (default 'true' when role=club, else no filter)
 *  - q: search string (name/email, case-insensitive)
 *  - page: 1-based page number (default 1)
 *  - limit: page size (default 25, max 100)
 *  - sort: mongoose sort string (default 'name')
 */
router.get('/', async (req, res) => {
    try {
        const { role, approved, q, page = '1', limit = '25', sort = 'name' } = req.query;

        const where = {};
        if (role) where.role = role; 

        // For clubs, default to approved=true unless caller explicitly sets approved
        if (role === 'club') {
            if (approved === 'true') where.approved = true;
            else if (approved === 'false') where.approved = false;
            else where.approved = true; // default
        } else if (approved === 'true' || approved === 'false') {
            where.approved = approved === 'true';
        }

        if (q) {
            const regex = new RegExp(String(q), 'i');
            where.$or = [{ name: regex }, { email: regex }];
        }

        const lim = Math.min(parseInt(limit, 10) || 25, 100);
        const pageN = Math.max(parseInt(page, 10) || 1, 1);
        const skip = (pageN - 1) * lim;

        const [items, total] = await Promise.all([
            User.find(where)
                .select('name email role approved profilePic') // only fields you need in UI
                .sort(sort)
                .skip(skip)
                .limit(lim),
            User.countDocuments(where),
        ]);

        res.json({
            items,             // array of users
            total,
            page: pageN,
            pageSize: lim,
        });
    } catch (err) {
        console.error('Admin list users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/admin/users/:id
 * Minimal read for a single user (e.g., if you want to prefill owner).
 */
router.get('/:id', async (req, res) => {
    try {
        const u = await User.findById(req.params.id)
            .select('name email role approved profilePic');
        if (!u) return res.status(404).json({ message: 'User not found' });
        res.json({ user: u });
    } catch (err) {
        console.error('Admin get user error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


/**
 * POST /api/admin/users
 * Create a new user (all inputs required except profilePic)
 */
router.post("/", upload.single("profilePic"), async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
  
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required (except profilePic)." });
      }
  
      const emailLower = String(email).toLowerCase().trim();
      if (!/\S+@\S+\.\S+/.test(emailLower)) {
        return res.status(400).json({ message: "Invalid email address." });
      }
  
      const existing = await User.findOne({ email: emailLower });
      if (existing) {
        return res.status(409).json({ message: "Email already in use." });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({
        name: name.trim(),
        email: emailLower,
        password: hashedPassword,
        role,
        approved: role === "user", // auto-approve students, require approval for clubs
        bio: "",
        profilePic: req.file?.path || req.file?.secure_url || "",
      });
  
      await newUser.save();
  
      res.status(201).json({
        message: "User created successfully.",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          approved: newUser.approved,
          profilePic: newUser.profilePic,
        },
      });
    } catch (err) {
      console.error("Admin create user error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

/**
 * PATCH /api/admin/users/:id
 * Update user fields (if password is blank, keep existing).
 */
router.patch("/:id", upload.single("profilePic"), async (req, res) => {
    try {
      const { name, email, password, role, approved } = req.body;
  
      const updateData = {};
      if (name) updateData.name = name.trim();
      if (email) updateData.email = String(email).toLowerCase().trim();
      if (role) updateData.role = role;
      if (approved !== undefined) updateData.approved = approved === "true" || approved === true;
  
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
  
      if (req.file) {
        updateData.profilePic = req.file?.path || req.file?.secure_url || "";
      }
  
      const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      }).select("name email role approved profilePic");
  
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
  
      res.json({ message: "User updated successfully.", user: updatedUser });
    } catch (err) {
      console.error("Admin update user error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

/**
 * DELETE /api/admin/users/:id
 * Delete a user completely.
 */
router.delete("/:id", async (req, res) => {
    try {
      const deleted = await User.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "User not found" });
  
      res.json({ message: "User deleted successfully." });
    } catch (err) {
      console.error("Admin delete user error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

module.exports = router;