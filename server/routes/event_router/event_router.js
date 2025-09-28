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

// helper: build full end datetime from date + endTime
function buildEndDateTime(event) {
  const baseDate = new Date(event.date);
  
  // Check if the base date is invalid 
  if (isNaN(baseDate.getTime())) {
    console.error(`Invalid base date for event ${event._id}: "${event.date}"`);
    return new Date('1900-01-01'); // Return current date as fallback
  }
  
  const endTimeStr = event.endTime || "23:59";
  
  //Remove AM/PM
  const cleanTime = endTimeStr.replace(/\s*(AM|PM)\s*/i, '');
  
  // Create the ISO string safely
  const dateStr = baseDate.toISOString().split("T")[0];
  const isoString = `${dateStr}T${cleanTime}`;
  
  const endDateTime = new Date(isoString);
  
  // If date is still invalid, fall back to end of day
  if (isNaN(endDateTime.getTime())) {
    console.warn(`Invalid endTime format for event ${event._id}: "${event.endTime}", using end of day`);
    return new Date(`${dateStr}T23:59:59`);
  }
  
  return endDateTime;
}

router.get('/all', async (req, res) => {
  try {
    const date = new Date();
    const allEvents = await Event.find({})
      .populate('eventOwner', 'name _id profilePic')
      .sort({ date: 1 });

    // Filter for upcoming events 
    const upcomingEvents = allEvents.filter(event => {
      const endDateTime = buildEndDateTime(event);
      return endDateTime >= date;
    });

    res.json({ events: upcomingEvents });
  } catch (err) {
    console.error('Error fetching all events:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// create event route
router.post('/create', auth, clubAuth, upload.single('coverPhoto'), async (req, res) => {
  try {
    const { eventTitle, eventDescription, startTime, endTime, tags, eventLocation } = req.body;

    const eventDate = req.body.date;
    if (!eventDate) return res.status(400).json({ message: 'Date is required' });

    const [year, month, day] = eventDate.split("-");
    const dateObj = new Date(year, month - 1, day);

    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid Date value' });
    }

    const eventCategory = (req.body.eventCategory || '').trim();
    const allowedCategories = Event.schema.path('eventCategory').enumValues;
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// /byOwner/me
router.get('/byOwner/me', auth, async (req, res) => {
  try {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const allEvents = await Event.find({ eventOwner: req.user.id })
      .populate('eventOwner', 'name _id profilePic')
      .sort({ date: 1 });

    const upcomingEvents = [];
    const pastEvents = [];

    allEvents.forEach(event => {
      const endDateTime = buildEndDateTime(event);
      if (endDateTime >= now) {
        upcomingEvents.push(event);
      } else if (endDateTime >= oneMonthAgo) {
        pastEvents.push(event);
      }
    });

    res.json({ upcomingEvents, pastEvents });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// byOwner/:ownerId (raw list, no split)
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

// /category/:categoryChoice
// fetching events by category
router.get('/category/:categoryChoice', async (req, res) => {
  try {
    const { categoryChoice } = req.params;
    const now = new Date();

    const events = await Event.find({ 
      eventCategory: categoryChoice,
      date: { $exists: true, $ne: null } // Only get events with valid dates
    })
      .populate('eventOwner', 'name _id profilePic')
      .sort({ date: 1 });

    const upcomingEvents = events.filter(event => {
      const baseDate = new Date(event.date);
      if (isNaN(baseDate.getTime())) {
        console.log(`Skipping event with invalid date: ${event.eventTitle} - ${event.date}`);
        return false;
      }

      //Also handle overnight events
      const startTime = event.startTime || "00:00";
      const endTimeStr = event.endTime || "23:59";
      let endDateTime = new Date(
        `${baseDate.toISOString().split("T")[0]}T${endTimeStr}`
      );

      if (endTimeStr < startTime){
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      console.log(`Event: ${event.eventTitle}, EndTime: ${endDateTime}, Now: ${now}, Upcoming: ${endDateTime >= now}`);
      return endDateTime >= now;
    });

    res.json(upcomingEvents);
  } catch (err) {
    console.error("Error fetching category events:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


// /byClub/:clubId
router.get('/byClub/:clubId', async (req, res) => {
  try {
    const { clubId } = req.params;
    console.log('=== FETCHING EVENTS FOR CLUB:', clubId, '===');

    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const allEvents = await Event.find({ eventOwner: clubId })
      .populate('eventOwner', 'name _id profilePic')
      .sort({ date: 1 });

    const upcomingEvents = [];
    const pastEvents = [];

    allEvents.forEach(event => {
      const endDateTime = buildEndDateTime(event);
      if (endDateTime >= now) {
        upcomingEvents.push(event);
      } else if (endDateTime >= oneMonthAgo) {
        pastEvents.push(event);
      }
    });

    res.json({ upcomingEvents, pastEvents });
  } catch (err) {
    console.error('Error fetching club events:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', auth, clubAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.eventOwner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single event (owner only)
router.get('/:id', auth, clubAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.eventOwner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update event
router.put('/:id', auth, clubAuth, upload.single('coverPhoto'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.eventOwner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

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
