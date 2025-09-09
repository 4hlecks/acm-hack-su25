const express = require('express');
const router = express.Router();
const User = require('../../models/users_schema');

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
