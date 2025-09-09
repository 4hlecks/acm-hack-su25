const express = require('express');
const router = express.Router();
const Club = require('../../models/club_schema');
const Event = require('../../models/event_schema');
const auth = require('../../middleware/auth');
const clubAuth = require('../../middleware/clubAuth');
const upload = require('../../middleware/upload');

//get all clubs
router.get('/', async (req, res) => {
    try{
        const clubs = await Club.find({approved: true});
        res.json(clubs);
    } catch (err){
        console.log(err);
        res.status(500).json({error: 'Server error: Check Connections!'})   
    }
});

//Search clubs by name
router.get('/search', async (req, res) => {
    try {
        const {query} = req.query;
        if (!query){
            return res.status(400).json({error: "Search query is required"});
        }
        
        const clubs = await Club.find({
            approved: true,
            name: {$regex: query, $options: 'i'}
        });

        res.json(clubs)
    } catch (error) {
        res.status(500).json({error: 'Server error'})
    }
})

//Update club profile 
router.put('/updateProfile', auth, clubAuth, upload.single('profilePic'), async (req, res) =>{
    try {
        const {bio} = req.body;
        const clubId = req.user.id;

        const updateData = {};
        if (bio !== undefined){
            updateData.bio = bio;
            console.log('Added bio to updateData');
        }

        if (req.file) {
            updateData.profilePic = req.file.path;
            console.log('Added file to updateData:', req.file.path);
            console.log('Full file object:', req.file);
        } else {
            console.log('No file received');
        }

        console.log('Final updateData:', updateData);

        const updatedClub = await Club.findByIdAndUpdate(
            clubId,
            updateData,
            {new: true, runValidators: true}
        )

        if (!updatedClub){
            return res.status(404).json({message: 'Club not found'})
        }

        console.log('Updated club:', {
            bio: updatedClub.bio,
            profilePic: updatedClub.profilePic
        });

        res.json({
            message: 'Profile updated successfully',
            club: {
                id: updatedClub._id,
                name: updatedClub.name,
                bio: updatedClub.bio,
                profilePic: updatedClub.profilePic
            }
        })
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({message: 'Server error', error: error.message})
    }
})

//Get Club's own profile (when club clicks 'Profile' Nav)
router.get('/profile/me', auth, clubAuth, async(req, res) => {
    try{
        const club = await Club.findById(req.user.id).select('-password')
        if(!club){
            return res.status(404).json({message: 'Club not found.'})
        }

        const events = await Event.find({eventOwner: req.user.id}).sort({createdAt: -1})
        res.json({
            id: club._id,
            name: club.name,
            email: club.email,
            bio: club.bio,
            profilePic: club.profilePic,
            approved:club.approved,
            role: club.role,
            events: events,
            eventCount: events.length
        })
    } catch (error){
        res.status(500).json({error: 'Server error'})
    }
})
module.exports = router;