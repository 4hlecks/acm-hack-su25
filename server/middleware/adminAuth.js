// middleware checks if admin
const User = require('../models/users_schema');


/**
 * Ensures the authenticated user is an admin.
 * @param req is the incoming HTTP request from client
 * @param res is the response replying to the client
 * @param next passes control to next in chain
 */
module.exports = async function authAdmin(req, res, next) {
    try {
        // Must be authenticated
        if (!req.user?.id) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // User must be a valid user/role in the DB
        const user = await User.findById(req.user.id).select('role');
        if (!user) return res.status(401).json({ message: 'Invalid user' });

        // Must be admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin only' });
        }

        // Convenience flag
        req.user.authAdmin = true;
        next();
    } catch (err) {
        console.error('authAdmin error:', err);
        res.status(500).json({ message: 'Server error '});
    }
};