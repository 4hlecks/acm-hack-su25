const express = require('express');
const router = express.Router();
const Event = require('../../models/event_schema');

// middleware 
const auth = require('../../middleware/auth');
const clubAuth = require('../../middleware/clubAuth');
const upload = require('../../middleware/upload');

// confirm which schema is loaded
console.log('Event schema keys:', Object.keys(Event.schema.paths));
console.log('Loaded Event model from:', require.resolve('../../models/event_schema'));
console.log('Allowed categories:', Event.schema.path('eventCategory').enumValues);

// create event route
router.post('/create', auth, clubAuth, upload.single('coverPhoto'), async (req, res) => {
  console.log("FRONTEND HIT THIS ROUTE");
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);
  console.log("USER:", req.user);

  try {
    const { eventTitle, eventDescription, startTime, endTime, tags, eventLocation } = req.body;

    const eventDate = req.body.Date;
    if (!eventDate) return res.status(400).json({ message: 'Date is required' });

    const dateObj = new Date(eventDate);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid Date value' });
    }

    // trim category then validate against enum
    const eventCategory = (req.body.eventCategory || '').trim();
    const allowedCategories = Event.schema.path('eventCategory').enumValues;
    console.log('Incoming category:', JSON.stringify(eventCategory));
    if (!allowedCategories.includes(eventCategory)) {
      return res.status(400).json({ message: 'Invalid Event Category' });
    }

    const newEvent = new Event({
      eventOwner: req.user.id,
      eventTitle,
      eventDescription,
      Date: dateObj,
      startTime,
      endTime,
      eventLocation,
      eventCategory,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      coverPhoto: req.file ? `/uploads/${req.file.filename}` : null
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
});

// Get events for the logged-in club
router.get('/byOwner/me', auth, async (req, res) => {
  try {
    const events = await Event.find({ eventOwner: req.user.id })
      .populate('eventOwner', 'name _id')
      .sort({ Date: 1 });
    res.json({ events });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// Get events for any owner by id (public)
router.get('/byOwner/:ownerId', async (req, res) => {
  try {
    const events = await Event.find({ eventOwner: req.params.ownerId })
      .populate('eventOwner', 'name _id')
      .sort({ Date: 1 });
    res.json({ events });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// fetching events by category (make the path explicit to avoid conflicts)
router.get('/category/:categoryChoice', async (req, res) => {
  try {
    const { categoryChoice } = req.params;
    const events = await Event.find({ eventCategory: categoryChoice })
      .populate('eventOwner', 'name _id')
      .sort({ Date: 1 });

    res.json(events);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error: Check Connections!' });
  }
});

module.exports = router;
