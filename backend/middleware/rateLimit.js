// Simple in-memory rate limit, used on login and registration to slow down password guessing.
// Counts are per client address and reset after `windowMinutes`.
const { HttpError } = require('../utils/http');

function rateLimit({ max, windowMinutes }) {
    const hits = new Map(); // ip -> { count, resetAt }
    const windowMs = windowMinutes * 60 * 1000;

    // Forget old entries so memory does not grow
    setInterval(() => {
        const now = Date.now();
        for (const [ip, entry] of hits) if (entry.resetAt <= now) hits.delete(ip);
    }, windowMs).unref();

    return (req, res, next) => {
        const now = Date.now();
        const entry = hits.get(req.ip);
        if (!entry || entry.resetAt <= now) {
            hits.set(req.ip, { count: 1, resetAt: now + windowMs });
            return next();
        }
        entry.count += 1;
        if (entry.count > max) {
            res.set('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
            return next(new HttpError(429, `Too many attempts. Please wait ${windowMinutes} minutes and try again.`));
        }
        next();
    };
}

module.exports = rateLimit;
