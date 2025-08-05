const express = require('express');
const router = express.Router();
const Event = require('../../models/event_schema');

// uses middleware 
const auth = require('../../middleware/auth');
const clubAuth = require('../../middleware/clubAuth');
const upload = require('../../middleware/upload');

// create event route
router.post('/create', auth, clubAuth, upload.single('coverPhoto'), async (req, res) => {
    try {
        const { title, description, startDate, endDate, startTime, endTime, tags, location, category } = req.body;
        
        const newEvent = new Event({
            clubId: req.user.id,
            title,
            description,
            startDate,
            endDate,
            startTime,
            endTime,
            tags: tags ? tags.split(',') : [],
            location,
            category,
            coverPhoto: req.file ? req.file.filename : null
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
        const events = await Event.find({category: categoryChoice}). 
            populate('clubId', 'name-_id').sort({startDate: 1}); 
        res.json(events);
    } catch (err){
        console.log(err);
        res.status(500).json({error: 'Server error: Check Connections!'})   
    }

});

module.exports = router;

