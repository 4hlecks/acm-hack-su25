const express = require('express');
const router = express.Router();
const Club = require('../../models/club_schema');

router.get('/', async (req, res) => {
    try{
        const clubs = await Club.find();
        res.json(clubs);
    } catch (err){
        console.log(err);
        res.status(500).json({error: 'Server error: Check Connections!'})   
    }
});

module.exports = router;