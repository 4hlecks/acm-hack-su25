const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users_schema.js'); // only one model now

// Register route
router.post('/register', express.json(), async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate email
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  // Validate role
  if (!['user', 'club'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  // Check for duplicates
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email already in use.' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = new User({
    name,
    email,
    password: hashedPassword,
    role,
    approved: role === 'user' ? true : false, // auto-approve students
    profilePic: "",
    bio: ""
  });

  await user.save();

  const message = role === 'club'
    ? 'Club registration submitted for approval.'
    : 'User registered successfully.';

  res.status(201).json({ message });
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Look up user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  // Clubs must be approved
  if (user.role === 'club' && !user.approved) {
    return res.status(403).json({ message: 'Club registration not yet approved.' });
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  // Create JWT
  const token = jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET || 'defaultsecret',
    { expiresIn: '12h' }
  );

  res.status(200).json({
    message: 'Login successful.',
    token,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      bio: user.bio,
      approved: user.approved
    }
  });
});

module.exports = router;
