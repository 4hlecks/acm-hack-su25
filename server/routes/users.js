const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/users_schema'); // ONLY users model now
const auth = require('../middleware/auth');
const clubAuth = require('../middleware/clubAuth');
const upload = require('../middleware/upload');

// Register
router.post('/register', async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    email = String(email).toLowerCase().trim();

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }

    if (!['user', 'club'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name.trim(),
      email,
      password: hashedPassword,
      role,
      approved: role === 'user', // auto-approve students
      profilePic: '',
      bio: ''
    });

    await user.save();

    const message =
      role === 'club'
        ? 'Club registration submitted for approval.'
        : 'User registered successfully.';

    res.status(201).json({ message });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    email = String(email).toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    if (user.role === 'club' && !user.approved) {
      return res.status(403).json({ message: 'Club registration not yet approved.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '12h' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        bio: user.bio,
        approved: user.approved
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get own club profile 
router.get('/profile/me', auth, clubAuth, async (req, res) => {
  try {
    const club = await User.findById(req.user.id)
      .select('name email role bio profilePic approved');
    if (!club) return res.status(404).json({ message: 'Club not found.' });
    res.json({ club });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update club profile
router.put('/updateProfile', auth, clubAuth, upload.single('profilePic'), async (req, res) => {
  try {
    const { bio } = req.body;
    const clubId = req.user.id;

    const updateData = {};
    if (bio !== undefined) {
      updateData.bio = bio;
      console.log('Added bio to updateData');
    }

    if (req.file) {
      updateData.profilePic = `/uploads/${req.file.filename}`; // updated link
      console.log('Added file to updateData:', updateData.profilePic);
      console.log('Full file object:', req.file);
    } else {
      console.log('No file received');
    }

    console.log('Final updateData:', updateData);

    const updatedClub = await User.findByIdAndUpdate(
      clubId,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedClub) {
      return res.status(404).json({ message: 'Club not found' });
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
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Club's own profile (when club clicks 'Profile' Nav)
router.get('/profile/me', auth, clubAuth, async (req, res) => {
  try {
    const club = await User.findById(req.user.id).select('-password');
    if (!club) {
      return res.status(404).json({ message: 'Club not found.' });
    }
    res.json({ club });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
