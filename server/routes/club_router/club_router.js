const express = require('express');
const router = express.Router();
const User = require('../../models/users_schema');

const auth = require('../../middleware/auth');
const clubAuth = require('../../middleware/clubAuth');
const upload = require('../../middleware/upload');

// List approved clubs
// GET /api/findClub
router.get('/', async (req, res) => {
  try {
    const clubs = await User
      .find({ role: 'club', approved: true })
      .select('name email bio profilePic approved');
    res.json(clubs);
  } catch (err) {
    console.error('Error listing clubs:', err);
    res.status(500).json({ message: 'Server error' });
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

// Get a single club by id
// GET /api/findClub/:id
router.get('/:id', async (req, res) => {
  try {
    const club = await User
      .findOne({ _id: req.params.id, role: 'club' })
      .select('name email bio profilePic approved');
    if (!club) return res.status(404).json({ message: 'Club not found' });
    res.json(club);
  } catch (err) {
    console.error('Error fetching club:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
