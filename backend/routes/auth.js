const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { createToken } = require('../utils/token');
const { authenticate } = require('../middleware/auth');
const { asyncHandler, HttpError, clean } = require('../utils/http');

const router = express.Router();

// Landing page for each role
const HOME_PAGES = { jobSeeker: '/jobseeker.html', company: '/company.html', admin: '/admin.html' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Case-insensitive match, so older accounts saved with capital letters still work
const CASE_INSENSITIVE = { locale: 'en', strength: 2 };

const publicUser = (user) => ({
    id: user._id,
    email: user.email,
    role: user.role,
    companyName: user.companyName || null,
});

// POST /api/register  { registerType, email, password, companyName }
router.post('/register', asyncHandler(async (req, res) => {
    const email = clean(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const role = clean(req.body.registerType);
    const companyName = clean(req.body.companyName);

    if (!['jobSeeker', 'company'].includes(role)) throw new HttpError(400, 'Please choose Job Seeker or Company');
    if (!EMAIL_PATTERN.test(email)) throw new HttpError(400, 'Please enter a valid email address');
    if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters');
    if (role === 'company' && !companyName) throw new HttpError(400, 'Company name is required');

    const existing = await User.findOne({ email }).collation(CASE_INSENSITIVE);
    if (existing) throw new HttpError(400, 'An account with this email already exists');

    await User.create({
        email,
        password: await bcrypt.hash(password, 10),
        role,
        companyName: role === 'company' ? companyName : undefined,
    });
    res.status(201).json({ success: true, message: 'Registration successful. Please log in.' });
}));

// POST /api/login  { userType, email, password }
router.post('/login', asyncHandler(async (req, res) => {
    const email = clean(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const role = clean(req.body.userType);

    const user = HOME_PAGES[role] && email && password
        ? await User.findOne({ email, role }).collation(CASE_INSENSITIVE)
        : null;
    // Same message whether the email or the password is wrong
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new HttpError(401, 'Incorrect email, password or account type');
    }

    res.json({
        success: true,
        token: createToken(user),
        user: publicUser(user),
        redirectTo: HOME_PAGES[user.role],
    });
}));

// GET /api/me  - who is logged in
router.get('/me', authenticate, (req, res) => {
    res.json({ success: true, user: publicUser(req.user) });
});

module.exports = router;
module.exports.HOME_PAGES = HOME_PAGES;
