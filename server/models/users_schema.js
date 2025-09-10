const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['club', 'user'], default: 'user' },
  approved: { type: Boolean, default: false }, // clubs: false until admin approves
  profilePic: { type: String, default: "" },
  bio: { type: String, default: "" }
}, {
  collection: 'users',
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
