const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users_schema.js');
const crypto = require('crypto');
// uncomment below when we have email set up
// const nodemailer = require('nodemailer');

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

// Updated Login Route with JWT
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

  // Generate JWT Token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'defaultsecret',
    { expiresIn: '1h' }
  );

  res.status(200).json({
    message: 'Login successful.',
    token, // Send token to frontend
    user: {
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
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

module.exports = router;
