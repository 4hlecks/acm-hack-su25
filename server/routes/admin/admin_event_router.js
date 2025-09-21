// routes/admin/admin_event_router.js
const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');
const upload = require('../../middleware/upload');

const Event = require('../../models/event_schema');

// All routes must be authenticated + admin
router.use(auth, adminAuth);

/**
 * GET /api/admin/events
 * Query parameters:
 * - query: string to search
 * - filterKey: field to search in
 * - category: eventCategory must match
 * - ownerId: filter by eventOwner
 * - dateFrom, dateTo: ISO 'YYYY-MM-DD'
 * - sort: mongoose sort string (default: -date)
 * - page: 1-based page number (default: 1)
 * - limit: page size (default: 25, max 100)
 */
router.get('/', async (req, res) => {
    try {
        const {
            query = '',
            filterKey = 'eventTitle',
            category,
            ownerId,
            dateFrom,
            dateTo,
            sort = '-date',
            page = '1',
            limit = '25',
        } = req.query;

        const where = {};
        if (category) where.eventCategory = category;
        if (ownerId) where.eventOwner = ownerId;
        if (dateFrom || dateTo) {
            where.date = {};
            if (dateFrom) where.date.$gte = new Date(dateFrom);
            if (dateTo)   where.date.$lte = new Date(dateTo);
        }

        if (query && filterKey) {
            where[filterKey] = { $regex: String(query), $options: 'i' };
        }

        const lim = Math.min(parseInt(limit, 10) || 25, 100);
        const pageN = Math.max(parseInt(page, 10) || 1, 1);
        const skip = (pageN - 1) * lim;

        const [items, total] = await Promise.all([
            Event.find(where)
                .populate('eventOwner', 'name _id profilePic')
                .sort(sort)
                .skip(skip)
                .limit(lim),
            Event.countDocuments(where),
        ]);

        res.json({ items, total, page: pageN, pageSize: lim });
    }   catch (err) {
        console.error('Admin list events error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/admin/events/:id
 * Return a single event (any owner).
 */
router.get('/:id', async (req, res) => {
    try {
        const ev = await Event.findById(req.params.id)
            .populate('eventOwner', 'name _id profilePic');
        if (!ev) return res.status(404).json({ message: 'Event not found' });
        res.json({ event: ev });
    }   catch (err) {
        console.error('Admin get event error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/admin/events
 * Create an event on behalf of a club (requires eventOwner in body).
 * Accepts multipart/form-data with optional coverPhoto file
 */
router.post('/', upload.single('coverPhoto'), async (req, res) => {
    try {
        const {
              eventTitle, eventDescription, date, startTime, endTime,
              eventLocation, eventCategory, tags, eventOwner
        } = req.body;

    if (!eventOwner) return res.status(400).json({ message: 'eventOwner is required' });

    const [y, m, d] = String(date).split('-');
    const dateObj = new Date(y, m - 1, d);
    if (isNaN(dateObj.getTime())) return res.status(400).json({ message: 'Invalid Date value' });

    const ev = new Event({
        eventOwner,
        eventTitle,
        eventDescription,
        date: dateObj,
        startTime,
        endTime,
        eventLocation,
        eventCategory,
        tags: tags ? String(tags).split(',').map(t => t.trim()).filter(Boolean) : [],
        coverPhoto: req.file ? (req.file.path || req.file.secure_url || req.file.url) : null,
    });
        await ev.save();
        await ev.populate('eventOwner', 'name _id profilePic');   // <-- populate here
        res.status(201).json({ message: 'Event created (admin)', event: ev });
    } catch (err) {
        console.error('Admin create event error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * PATCH /api/admin/events/:id
 * Partial update for any event (ownership bypass).
 * Accepts JSON or multipart/form-data (when updating coverPhoto).
 */
router.patch('/:id', upload.single('coverPhoto'), async (req, res) => {
    try {
        const update = {};
        const setIfDefined = (key) => {
        if (req.body[key] !== undefined) update[key] = req.body[key];
        };
        ['eventTitle','eventDescription','startTime','endTime','eventLocation','eventCategory','eventOwner'].forEach(setIfDefined);

        if (req.body.date) {
            const [y, m, d] = String(req.body.date).split('-');
            update.date = new Date(y, m - 1, d);
        }
        if (req.body.tags !== undefined) {
            update.tags = String(req.body.tags).split(',').map(t => t.trim()).filter(Boolean);
        }
        if (req.file) {
            update.coverPhoto = req.file.path || req.file.secure_url || req.file.url;
        }

        let ev = await Event.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
        if (!ev) return res.status(404).json({ message: 'Event not found' });

        ev = await ev.populate('eventOwner', 'name _id profilePic'); // <-- and here
        res.json({ message: 'Event updated (admin)', event: ev });
    } catch (err) {
        console.error('Admin update event error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * DELETE /api/admin/events/:id
 * Delete any event (no ownership requirement).
 */
router.delete('/:id', async (req, res) => {
    try {
        const ev = await Event.findById(req.params.id);
        if (!ev) return res.status(404).json({ message: 'Event not found' });
        await ev.deleteOne();
        res.json({ message: 'Event deleted by admin' });
    }   catch (err) {
        console.error('Admin delete event error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;