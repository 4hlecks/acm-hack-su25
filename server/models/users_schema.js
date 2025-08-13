const mongoose = require('mongoose');
const userSchemaOptions = {
  discriminatorKey: 'role',
  collection: 'users'
};

// structure and rules for user documents in MongoDB
const userSchema = new mongoose.Schema({
    // required: users full name  
    name: { type: String, required: true },
    // required: users email
    email: { type: String, required: true, unique: true },
    // required: users password
    password: { type: String, required: true },
    // asks if the user is a regular user or a club affiliate
    role: { type: String, enum: ['club', 'user'], default: 'user' },
    // only used for club affiliates (UCSD emails)
    approved: { type: Boolean, default: false },
    // for resetting password
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, userSchemaOptions);

const User = mongoose.model('User', userSchema);
module.exports = User;