// routes/admin/admin_users_router.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');
const User = require('../../models/users_schema');

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
        const {
            role = 'club',
            approved,
            q,
            page = '1',
            limit = '25',
            sort = 'name',
        } = req.query;

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

module.exports = router;