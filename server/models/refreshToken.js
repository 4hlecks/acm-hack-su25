// tracks and disables refresh tokens for staying logged in & logout
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  jti:  { type: String, index: true, required: true, unique: true },
  revokedAt: { type: Date },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
}, { timestamps: true, collection: 'refresh_tokens' });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);