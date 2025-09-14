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

    const eventDate = req.body.date;
    if (!eventDate) return res.status(400).json({ message: 'Date is required' });

    const [year, month, day] = eventDate.split("-");
    const dateObj = new Date(year, month - 1, day);

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
      date: dateObj,
      startTime,
      endTime,
      eventLocation,
      eventCategory,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      coverPhoto: req.file ? req.file.path : null
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
      .populate('eventOwner', 'name _id profilePic')
      .sort({ date: 1 });
    res.json({ events });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});


// Get events for any owner by id (public)
router.get('/byOwner/:ownerId', async (req, res) => {
  try {
    const events = await Event.find({ eventOwner: req.params.ownerId })
      .populate('eventOwner', 'name _id profilePic')
      .sort({ date: 1 });
    res.json({ events });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// fetching events by category (make the path explicit to avoid conflicts)
router.get('/category/:categoryChoice', async (req, res) => {
  try {
    const { categoryChoice } = req.params;
    const now = new Date();

    const events = await Event.find({
      eventCategory: categoryChoice,
      endTime: { $gte: now }  
    })
      .populate('eventOwner', 'name _id profilePic')
      .sort({ date: 1 });

    res.json(events);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error: Check Connections!' });
  }
});

// Get events for a specific club
router.get('/byClub/:clubId', async (req, res) => {
  try {
    const events = await Event.find({ eventOwner: req.params.clubId })
      .populate('eventOwner', 'name _id profilePic')
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error('Error fetching club events:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an event by ID (only owner can delete)
router.delete('/:id', auth, clubAuth, async (req, res) => {
  try {
    console.log("DELETE route hit!");
    console.log("User making request:", req.user);
    console.log("Event ID param:", req.params.id);

    const event = await Event.findById(req.params.id);
    console.log("Event found:", event);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // ensure the logged-in user owns it
    if (event.eventOwner.toString() !== req.user.id) {
      console.log("Not authorized. Event owner:", event.eventOwner.toString(), "User:", req.user.id);
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    console.log("Event deleted:", event._id);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single event by ID (owner only)
router.get('/:id', auth, clubAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // ensure the logged-in user owns it
    if (event.eventOwner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this event' });
    }

    res.json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update event by ID (only owner can update)
router.put('/:id', auth, clubAuth, upload.single('coverPhoto'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // ensure the logged-in user owns it
    if (event.eventOwner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    // build update data
    const updateData = {
      eventTitle: req.body.eventTitle,
      eventDescription: req.body.eventDescription,
      date: req.body.date
        ? (() => {
            const [y, m, d] = req.body.date.split("-");
            return new Date(y, m - 1, d);
          })()
        : event.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      eventLocation: req.body.eventLocation,
      eventCategory: req.body.eventCategory,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : event.tags,
    };

    if (req.file) {
      updateData.coverPhoto = req.file.path;
    }
    

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


module.exports = router;
