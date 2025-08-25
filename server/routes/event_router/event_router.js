const express = require('express');
const router = express.Router();
const Event = require('../../models/event_schema');

// uses middleware 
const auth = require('../../middleware/auth');
const clubAuth = require('../../middleware/clubAuth');
const upload = require('../../middleware/upload');

// create event route
router.post('/create', auth, clubAuth, upload.single('coverPhoto'), async (req, res) => {
    console.log('BODY:', req.body);
    console.log('FILE:', req.file);
    console.log('USER:', req.user);
    try {
        const { eventTitle, eventDescription, startDate, endDate, startTime, endTime, tags, eventLocation, eventCategory } = req.body;
        
        const newEvent = new Event({
            eventOwner: req.user.id,
            eventTitle,
            eventDescription,
            startDate,
            endDate,
            startTime,
            endTime,
            tags: tags ? tags.split(',') : [],
            eventLocation,
            eventCategory,
            coverPhoto: req.file ? (req.file.secure_url || req.file.path) : 'https://via.placeholder.com/400x200'
          });

        await newEvent.save();
        res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// fetching events by category
router.get('/:categoryChoice', async (req, res) => {
    try{ 
        const {categoryChoice} = req.params;
        const events = await Event.find({eventCategory: categoryChoice}). 
            populate('eventOwner', 'name profilePic').sort({startDate: 1}); 
        res.json(events);
    } catch (err){
        console.log(err);
        res.status(500).json({error: 'Server error: Check Connections!'})   
    }

});

module.exports = router;
