// checks if user has club role and is approved by admin
const User = require('../models/users_schema');

const clubAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'club' || !user.approved) {
            return res.status(403).json({ message: 'Access denied: Clubs only' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = clubAuth;

