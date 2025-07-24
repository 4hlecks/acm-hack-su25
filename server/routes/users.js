const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const bcrypt = require('bcrypt');


// General user registration
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
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
    role: 'user'
  });

  await user.save();
  res.status(201).json({ message: 'User registered successfully.' });
});

// Club registration
router.post('/club/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!email.endsWith('@ucsd.edu')) {
    return res.status(403).json({ message: 'UCSD email required for club registration.' });
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
    role: 'club',
    approved: false
  });

  await user.save();
  res.status(201).json({ message: 'Club registration submitted for approval.' });
});


// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  // Optional: if frontend wants to make successful login message to user
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


// router.get('/', function(req, res, next) {
//   const user = {
//     name: 'ACM Hack',
//     email: 'hack@acmucsd.org'
//   }
//   res.status(200).json({ user });
// });