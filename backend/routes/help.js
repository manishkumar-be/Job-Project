// Help requests: any logged-in user can ask for help, admins manage them
const express = require('express');
const Help = require('../models/Help');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncHandler, HttpError, isValidId, clean } = require('../utils/http');

const router = express.Router();
router.use(authenticate);

// POST /api/help  { issue }
router.post('/', asyncHandler(async (req, res) => {
    await Help.create({ userEmail: req.user.email, issue: clean(req.body.issue) });
    res.status(201).json({ success: true, message: 'Your help request has been sent. An admin will look into it.' });
}));

// GET /api/help  - all requests, unresolved first
router.get('/', requireRole('admin'), asyncHandler(async (req, res) => {
    const requests = await Help.find().sort({ resolved: 1, date: -1 });
    res.json(requests);
}));

async function findRequest(id) {
    if (!isValidId(id)) throw new HttpError(400, 'Invalid help request id');
    const request = await Help.findById(id);
    if (!request) throw new HttpError(404, 'Help request not found');
    return request;
}

// PATCH /api/help/:id/resolve
router.patch('/:id/resolve', requireRole('admin'), asyncHandler(async (req, res) => {
    const request = await findRequest(req.params.id);
    request.resolved = true;
    await request.save();
    res.json({ success: true, message: 'Help request marked as resolved' });
}));

// DELETE /api/help/:id
router.delete('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
    const request = await findRequest(req.params.id);
    await request.deleteOne();
    res.json({ success: true, message: 'Help request deleted' });
}));

module.exports = router;
