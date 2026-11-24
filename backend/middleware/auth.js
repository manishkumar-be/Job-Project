const User = require('../models/User');
const { verifyToken } = require('../utils/token');
const { asyncHandler, HttpError } = require('../utils/http');

// Requires a valid "Authorization: Bearer <token>" header and loads the user.
// The user is read from the database on every request, so a deleted user or a
// changed role takes effect immediately.
const authenticate = asyncHandler(async (req, res, next) => {
    const header = req.get('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const payload = verifyToken(token);
    if (!payload) throw new HttpError(401, 'Please log in to continue');

    const user = await User.findById(payload.id);
    if (!user) throw new HttpError(401, 'Your account no longer exists. Please log in again');

    req.user = user;
    next();
});

// Use after authenticate: only lets the listed roles through.
const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return next(new HttpError(403, 'You do not have permission to do this'));
    }
    next();
};

module.exports = { authenticate, requireRole };
