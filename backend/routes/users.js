// User management for admins
const express = require('express');
const User = require('../models/User');
const { ROLES } = require('../models/User');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncHandler, HttpError, isValidId, clean } = require('../utils/http');

const router = express.Router();
router.use(authenticate, requireRole('admin'));

async function findUser(id) {
    if (!isValidId(id)) throw new HttpError(400, 'Invalid user id');
    const user = await User.findById(id);
    if (!user) throw new HttpError(404, 'User not found');
    return user;
}

// GET /api/users  - newest first (passwords are never sent)
router.get('/', asyncHandler(async (req, res) => {
    const users = await User.find().sort({ createdAt: -1, _id: -1 });
    res.json(users);
}));

// PUT /api/users/:id  { email, role, companyName }
router.put('/:id', asyncHandler(async (req, res) => {
    const user = await findUser(req.params.id);
    const email = clean(req.body.email).toLowerCase();
    const role = clean(req.body.role);
    const companyName = clean(req.body.companyName);

    if (!email) throw new HttpError(400, 'Email is required');
    if (!ROLES.includes(role)) throw new HttpError(400, 'Role must be jobSeeker, company or admin');
    if (role === 'company' && !companyName) throw new HttpError(400, 'Company name is required for companies');
    if (String(user._id) === String(req.user._id) && role !== 'admin') {
        throw new HttpError(400, 'You cannot remove your own admin role');
    }
    const taken = await User.findOne({ email, _id: { $ne: user._id } }).collation({ locale: 'en', strength: 2 });
    if (taken) throw new HttpError(400, 'Another account already uses this email');

    user.email = email;
    user.role = role;
    user.companyName = role === 'company' ? companyName : undefined;
    await user.save();
    res.json({ success: true, message: 'User updated successfully', user });
}));

// DELETE /api/users/:id
router.delete('/:id', asyncHandler(async (req, res) => {
    const user = await findUser(req.params.id);
    if (String(user._id) === String(req.user._id)) throw new HttpError(400, 'You cannot delete your own account');
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
}));

module.exports = router;
