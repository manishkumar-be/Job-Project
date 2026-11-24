// Company profile of the logged-in company
const express = require('express');
const CompanyProfile = require('../models/CompanyProfile');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncHandler, clean } = require('../utils/http');

const router = express.Router();
router.use(authenticate, requireRole('company'));

// GET /api/company/profile  - null if the company has not saved one yet
router.get('/profile', asyncHandler(async (req, res) => {
    const profile = await CompanyProfile.findOne({ companyId: req.user._id });
    res.json({
        success: true,
        profile,
        accountCompanyName: req.user.companyName || '', // Used to pre-fill the form
    });
}));

// PUT /api/company/profile  { companyName, aboutCompany }
router.put('/profile', asyncHandler(async (req, res) => {
    const profile = await CompanyProfile.findOneAndUpdate(
        { companyId: req.user._id },
        { companyName: clean(req.body.companyName), aboutCompany: clean(req.body.aboutCompany) },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, message: 'Company profile saved successfully!', profile });
}));

module.exports = router;
