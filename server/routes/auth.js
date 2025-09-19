// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/users_schema');      // adjust path if different
const RefreshToken = require('../models/refreshToken');

const router = express.Router();
const isProd = process.env.NODE_ENV === 'production';
const COOKIE_NAME = process.env.COOKIE_NAME || 'rt';

function signAccessToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_TTL || '15m'
  });
}

function signRefreshToken(userId, jti) {
  return jwt.sign({ id: userId, jti }, process.env.REFRESH_JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_TTL || '30d'
  });
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: isProd ? 'strict' : 'lax',
    secure: isProd,              // true on HTTPS
    path: '/auth',               // cookie only sent to /auth routes
  };
}

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  // Create/record refresh token
  const jti = crypto.randomUUID();
  const refreshJwt = signRefreshToken(user._id.toString(), jti);
  const { exp } = jwt.decode(refreshJwt);
  await RefreshToken.create({
    user: user._id,
    jti,
    expiresAt: new Date(exp * 1000)
  });

  // Short-lived access token (client uses in Authorization header)
  const accessToken = signAccessToken(user._id.toString());
  return res
    .cookie(COOKIE_NAME, refreshJwt, refreshCookieOptions())
    .json({
      accessToken,
      user: { id: user._id, email: user.email, role: user.role }
    });
});

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const payload = jwt.verify(token, process.env.REFRESH_JWT_SECRET);
    const { id: userId, jti } = payload;

    const rt = await RefreshToken.findOne({ jti, user: userId });
    if (!rt || rt.revokedAt) return res.status(401).json({ message: 'Refresh revoked' });

    // rotate
    rt.revokedAt = new Date();
    await rt.save();

    const newJti = crypto.randomUUID();
    const newRefresh = signRefreshToken(userId, newJti);
    const { exp } = jwt.decode(newRefresh);
    await RefreshToken.create({
      user: userId, jti: newJti, expiresAt: new Date(exp * 1000)
    });

    const accessToken = signAccessToken(userId);
    return res
      .cookie(COOKIE_NAME, newRefresh, refreshCookieOptions())
      .json({ accessToken });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// POST /auth/logout
router.post('/logout', async (req, res) => {
  const token = req.cookies[COOKIE_NAME];
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.REFRESH_JWT_SECRET);
      await RefreshToken.updateOne(
        { jti: payload.jti, user: payload.id, revokedAt: { $exists: false } },
        { $set: { revokedAt: new Date() } }
      );
    } catch (_) { /* ignore */ }
  }
  res.clearCookie(COOKIE_NAME, refreshCookieOptions());
  return res.json({ message: 'Logged out' });
});

module.exports = router;
