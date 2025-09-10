const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

module.exports = function (req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  console.log("JWT_SECRET used for verify:", `"${JWT_SECRET}"`);
  console.log("Incoming token:", token);

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Token error:', err.message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
