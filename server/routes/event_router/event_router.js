const express = require('express');
const router = express.Router();
const Event = require('../../models/event_schema');

router.get('/api/loadEvents/:categoryChoice', async (req, res) => {
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