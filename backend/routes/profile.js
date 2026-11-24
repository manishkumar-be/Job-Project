// Job seeker profile
const express = require('express');
const Profile = require('../models/Profile');
const { authenticate, requireRole } = require('../middleware/auth');
const { upload, fileUrl, removeUpload } = require('../middleware/upload');
const { asyncHandler, HttpError, clean, toList } = require('../utils/http');

const router = express.Router();
router.use(authenticate, requireRole('jobSeeker'));

// GET /api/profile  - the logged-in job seeker's profile (null if none yet)
router.get('/', asyncHandler(async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user._id });
    res.json({ success: true, profile });
}));

// POST /api/profile  (multipart form) - create or update the profile
router.post('/', upload.fields([
    { name: 'certificate', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
]), asyncHandler(async (req, res) => {
    const files = req.files || {};
    const newCertificate = files.certificate?.[0];
    const newResume = files.resume?.[0];

    try {
        const name = clean(req.body.name);
        if (!name) throw new HttpError(400, 'Name is required');

        const mobileNumbers = toList(req.body.mobileNumbers).filter(Boolean);
        if (mobileNumbers.some(n => !/^\d{10}$/.test(n))) {
            throw new HttpError(400, 'Mobile numbers must have exactly 10 digits');
        }

        // The form sends parallel lists: educationLevels[i], institution[i], ...
        const levels = toList(req.body.educationLevels);
        const institutions = toList(req.body.institution);
        const percentages = toList(req.body.percentage);
        const passingYears = toList(req.body.passingYear);
        const education = levels
            .map((level, i) => ({
                educationLevel: level,
                institution: institutions[i] || '',
                percentage: percentages[i] || '',
                passingYear: passingYears[i] || '',
            }))
            .filter(e => e.institution); // Skip empty rows

        const update = {
            name,
            gender: clean(req.body.gender) || undefined,
            dob: clean(req.body.dob) || undefined,
            mobileNumbers,
            emails: toList(req.body.emails).filter(Boolean),
            education,
            skills: toList(req.body.skills).filter(Boolean),
            projects: toList(req.body.projects).filter(Boolean),
        };

        const existing = await Profile.findOne({ userId: req.user._id });
        // Keep the old files unless new ones were uploaded
        if (newCertificate) update.certificate = fileUrl(newCertificate);
        if (newResume) update.resume = fileUrl(newResume);

        const profile = await Profile.findOneAndUpdate(
            { userId: req.user._id },
            { $set: update },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        // The new files replaced the old ones
        if (existing && newCertificate) removeUpload(existing.certificate);
        if (existing && newResume) removeUpload(existing.resume);

        res.json({ success: true, message: existing ? 'Profile updated' : 'Profile saved', profile });
    } catch (error) {
        // Do not leave unused files behind when saving fails
        if (newCertificate) removeUpload(fileUrl(newCertificate));
        if (newResume) removeUpload(fileUrl(newResume));
        throw error;
    }
}));

module.exports = router;
