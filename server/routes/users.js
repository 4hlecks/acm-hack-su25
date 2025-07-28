const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/users_schema.js');

// Sign Up Route (All emails can sign up & answer question if they are club/student)
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

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
    name,
    email,
    password: hashedPassword,
    role,
    approved: role === 'club' ? false : undefined
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

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  if (user.role === 'club' && !user.approved) {
    return res.status(403).json({ message: 'Club registration not yet approved.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  res.status(200).json({
    message: 'Login successful.',
    user: {
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

module.exports = router;
