// Feedback: any logged-in user can send it, admins read it
const express = require('express');
const Feedback = require('../models/Feedback');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncHandler, HttpError, isValidId, clean } = require('../utils/http');

const router = express.Router();
router.use(authenticate);

// POST /api/feedback  { message }
router.post('/', asyncHandler(async (req, res) => {
    await Feedback.create({ userEmail: req.user.email, message: clean(req.body.message) });
    res.status(201).json({ success: true, message: 'Thank you! Your feedback has been submitted.' });
}));

// GET /api/feedback  - newest first
router.get('/', requireRole('admin'), asyncHandler(async (req, res) => {
    const feedbackList = await Feedback.find().sort({ date: -1 });
    res.json(feedbackList);
}));

// DELETE /api/feedback/:id
router.delete('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
    if (!isValidId(req.params.id)) throw new HttpError(400, 'Invalid feedback id');
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) throw new HttpError(404, 'Feedback not found');
    res.json({ success: true, message: 'Feedback deleted' });
}));

module.exports = router;
