const Usuario = require('../models/usuario');

const auth = async (req, res, next) => {
    try {
        const userId = req.header('userId') || req.body.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required. Please provide userId in header or body.' });
        }

        const user = await Usuario.findById(userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check session expiration (3 hours)
        const sessionDuration = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
        const now = new Date();
        const lastActivity = new Date(user.lastActivity);

        if (now - lastActivity > sessionDuration) {
            return res.status(401).json({ message: 'Session expired. Please login again.' });
        }

        // Update last activity
        user.lastActivity = now;
        await user.save();

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = auth;
