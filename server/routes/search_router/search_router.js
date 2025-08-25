const express = require('express');
const router = express.Router();
const Event = require('../../models/event_schema');
const Club = require('../../models/club_schema');

//Search clubs by name
router.get('/all', async (req, res) => {
    try {
        const {query} = req.query;
        if (!query){
            return res.status(400).json({error: "Search query is required"});
        }

        //look for evenst
        const events = await Event.find({
            $or: [
                {eventTitle: {$regex: query, $options: 'i'}},
                {eventLocation: {$regex: query, $options: 'i'}},
                {eventDescription: {$regex: query, $options: 'i'}},
                {eventCategory: {$regex: query, $options: 'i'}}
            ]
        })
        .populate('eventOwner', 'name profilePic').sort({startDate: 1})
        
        //look for clubs
        const clubs = await Club.find({
            approved: true,
            name: {$regex: query, $options: 'i'}
        });

        res.json({events, clubs, 
            query, 
            totalResults: events.length + clubs.length}) //Found #results for 'query'

    } catch (error) {
        res.status(500).json({error: 'Server error'})
    }
})

module.exports = router;