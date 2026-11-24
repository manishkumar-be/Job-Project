// Company reviews written by job seekers
const express = require('express');
const CompanyReview = require('../models/CompanyReview');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncHandler, HttpError, clean, escapeRegex } = require('../utils/http');

const router = express.Router();
router.use(authenticate);

// GET /api/reviews?company=Acme  - all reviews, optionally filtered by company name
router.get('/', asyncHandler(async (req, res) => {
    const company = clean(req.query.company);
    const filter = company ? { companyName: new RegExp(escapeRegex(company), 'i') } : {};
    const reviews = await CompanyReview.find(filter).sort({ timestamp: -1 });
    res.json(reviews);
}));

// POST /api/reviews  { companyName, rating, reason }
router.post('/', requireRole('jobSeeker'), asyncHandler(async (req, res) => {
    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
        throw new HttpError(400, 'Rating must be a whole number from 1 to 10');
    }
    const review = await CompanyReview.create({
        companyName: clean(req.body.companyName),
        rating,
        reason: clean(req.body.reason),
        userId: req.user._id,
    });
    res.status(201).json({ success: true, message: 'Thank you for your review!', review });
}));

module.exports = router;
