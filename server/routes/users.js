const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/users_schema'); // ONLY users model now
const Event = require('../models/event_schema')
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

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  // checks email existence in MongoDB
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: 'If that email exists, a reset link has been sent! Check inbox or spam :)' });
  }

  // hashing rawToken for reset link in email so others can't use token directly
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  // expiration time 30 mins
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 15 minutes

  await user.save();

  // reset link in the email 
  // ****** REPLACE CLIENT_URL WITH FRONTEND SITE LINK ********
  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
  
  // DEV: log reset link instead of sending email 
  // ****** DELETE AFTER EMAIL SET UP *******
  console.log(`Password reset link: ${resetLink}`);

  // Code for when we send reset link via email using Nodemailer
  // ****** uncomment after our email connected to the website is set up *****
  /*
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  await transporter.sendMail({
    to: user.email,
    subject: 'Password Reset',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
  });
  */

  res.json({ message: 'If that email exists, a reset link has been sent! Check inbox or spam :)' });
});

// Resetting Password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // looks for user whose resetPasswordToken matches the hashed token and resetPasswordExpires is still valid
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }

  // new password hashed before storing
  const hashedPassword = await bcrypt.hash(password, 10);
  // updates the user’s password to the new hashed password.
  user.password = hashedPassword;
  // clears the reset token and expiration time so the token can’t be reused.
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  // saves the updated user object back to MongoDB
  await user.save();

  res.json({ message: 'Password has been reset successfully.' });
});

// Get own club profile 
router.get('/profile/me', auth, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const user = await User.findById(req.user.id)
      .select('name email role bio profilePic approved updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    
    if (user.role === 'club') {
      res.json({ club: user });
    } else {
      res.json({ user: user });
    }
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update club profile
router.put('/updateProfile', auth, clubAuth, upload.single('profilePic'), async (req, res) => {
  try {
    console.log("REQ FILE FULL:", req.file);
    console.log("REQ BODY:", req.body);

    const { bio, name } = req.body;
    const clubId = req.user.id;

    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (name !== undefined) updateData.name = name.trim();

    let message = "Profile updated successfully";
    if (req.file) {
      updateData.profilePic = req.file.path || req.file.secure_url || req.file.url;
      message = "Profile Picture Updated!"; 
    } else if (bio !== undefined || name !== undefined) {
      message = "Profile Info Updated!"; 
    }

    const updatedClub = await User.findByIdAndUpdate(
      clubId,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedClub) return res.status(404).json({ message: 'Club not found' });
    
    res.json({
      message, 
      club: {
        id: updatedClub._id,
        name: updatedClub.name,
        bio: updatedClub.bio,
        profilePic: updatedClub.profilePic,
        updatedAt: updatedClub.updatedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public profile by user/club ID (no auth needed)
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name role bio profilePic approved updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ club: user }); // ✅ same shape as /profile/me
  } catch (err) {
    console.error('Public profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


//GET user's saved events
router.get('/:userId/saved-events', auth, async (req, res) => {
  try{
    const {userId} = req.params;

    if (req.user.id !== userId){
      return res.status(403).json({error : 'Unauthorized to access this data'});
    }

    //Find user and populate saved events
    const user = await User.findById(userId).populate('savedEvents');

    if (!user){
      return res.status(404).json({error: 'User not found'});
    }

    res.json(user.savedEvents);
  } catch (error){
    console.error('Error fetching saved events:', error);
    res.status(500).json({error: 'Internal server error'});
  }
})

//POST - Save an event
router.post('/:userId/saved-events/:eventId', auth, async (req, res) => {
  try{
    const {userId, eventId} = req.params;
    console.log("Save event - userId:", userId, "eventId:", eventId);
    console.log("Authenticated user ID:", req.user.id);

    if (req.user.id !== userId){
      return res.status(403).json({error: 'Unauthorized'})
    }

    //Check if event exists
    console.log("Looking for event with ID:", eventId);
    const event = await Event.findById(eventId);
    if (!event){
      return res.status(404).json({error: 'Event not found'})
    }

    //Add event to user's saved events 
    const user = await User.findByIdAndUpdate(
      userId,
      {$addToSet: {savedEvents: eventId}},
      {new: true}
    ).populate('savedEvents');

    if (!user){
      return res.status(404).json({error: 'User not found'});
    }

    res.json({
      message: 'Event saved successfully.',
      savedEvents: user.savedEvents
    });
  } catch (error){
    console.error('Error saving event:', error);
    res.status(500).json({error: 'Internal server error'})
  }
})

//DELETE saved events
router.delete('/:userId/saved-events/:eventId', auth, async (req, res) => {
  try{
    const {userId, eventId} = req.params;

    if (req.user.id !== userId){
      return res.status(403).json({error: 'Unauthorized'});
    }

    //Remove event from user's saved events
    const user = await User.findByIdAndUpdate(
      userId,
      {$pull: {savedEvents: eventId}},
      {new: true}
    ).populate('savedEvents');

    if (!user){
      return res.status(404).json({error: 'User not found'})
    }

    res.json({
      message: 'Event removed from saved events',
      savedEvents: user.savedEvents
    });
  } catch (error){
    console.error('Error removing saved event:', error);
    res.status(500).json({error: 'Internal server error'})
  }
});

module.exports = router;
