// Job applications
const express = require('express');
const Application = require('../models/Application');
const { STATUSES } = require('../models/Application');
const JobPost = require('../models/JobPost');
const { authenticate, requireRole } = require('../middleware/auth');
const { upload, fileUrl, removeUpload } = require('../middleware/upload');
const { asyncHandler, HttpError, isValidId, clean } = require('../utils/http');

const router = express.Router();
router.use(authenticate);

// Shape sent to the browser, with the job details filled in
const withJob = (application) => {
    const app = application.toJSON();
    const job = application.jobId && typeof application.jobId === 'object' && application.jobId.postName ? application.jobId : null;
    app.jobId = job ? job._id : application.jobId;
    app.jobTitle = job ? job.postName : 'Job post removed';
    app.companyName = job ? job.companyName : '';
    return app;
};

// POST /api/applications  (multipart: resume file + application JSON) - job seeker applies
router.post('/', requireRole('jobSeeker'), upload.single('resume'), asyncHandler(async (req, res) => {
    try {
        if (!req.file) throw new HttpError(400, 'Please upload your resume');

        let data;
        try {
            data = JSON.parse(req.body.application || '{}');
        } catch {
            throw new HttpError(400, 'Invalid application data');
        }

        if (!isValidId(data.jobId)) throw new HttpError(400, 'Invalid job');
        const job = await JobPost.findById(data.jobId);
        if (!job) throw new HttpError(404, 'This job post no longer exists');

        const already = await Application.findOne({ jobId: job._id, seekerId: req.user._id });
        if (already) throw new HttpError(400, 'You have already applied for this job');

        const phone = clean(data.phone);
        if (!/^\d{10}$/.test(phone)) throw new HttpError(400, 'Mobile number must have exactly 10 digits');

        await Application.create({
            jobId: job._id,
            seekerId: req.user._id,
            name: clean(data.name),
            phone,
            email: clean(data.email) || req.user.email,
            resume: fileUrl(req.file),
        });
        res.status(201).json({ success: true, message: 'Application submitted successfully!' });
    } catch (error) {
        if (req.file) removeUpload(fileUrl(req.file)); // Do not keep the resume of a failed application
        throw error;
    }
}));

// GET /api/applications/mine  - the job seeker's own applications
router.get('/mine', requireRole('jobSeeker'), asyncHandler(async (req, res) => {
    const applications = await Application.find({ seekerId: req.user._id }).populate('jobId').sort({ createdAt: -1 });
    res.json(applications.map(withJob));
}));

// GET /api/applications/company  - applications to the logged-in company's jobs
router.get('/company', requireRole('company'), asyncHandler(async (req, res) => {
    const jobs = await JobPost.find({ companyId: req.user._id }).select('_id');
    const applications = await Application.find({ jobId: { $in: jobs.map(j => j._id) } })
        .populate('jobId')
        .sort({ createdAt: -1 });
    res.json(applications.map(withJob));
}));

// PUT /api/applications/:id/status  { status } - company accepts / rejects
router.put('/:id/status', requireRole('company'), asyncHandler(async (req, res) => {
    const status = clean(req.body.status);
    if (!STATUSES.includes(status)) throw new HttpError(400, `Status must be ${STATUSES.join(', ')}`);
    if (!isValidId(req.params.id)) throw new HttpError(400, 'Invalid application id');

    const application = await Application.findById(req.params.id).populate('jobId');
    if (!application) throw new HttpError(404, 'Application not found');
    if (!application.jobId || String(application.jobId.companyId) !== String(req.user._id)) {
        throw new HttpError(403, 'This application is not for one of your jobs');
    }

    application.status = status;
    await application.save();
    res.json({ success: true, message: `Application status updated to ${status}` });
}));

module.exports = router;
