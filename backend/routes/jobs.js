// Job posts
const express = require('express');
const JobPost = require('../models/JobPost');
const { WORK_TYPES } = require('../models/JobPost');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncHandler, HttpError, isValidId, clean } = require('../utils/http');

const router = express.Router();
router.use(authenticate);

// Accept "online", "OFFLINE" etc. and store the standard spelling
const normaliseWorkType = (value) => {
    const text = clean(value);
    if (!text) return undefined;
    return WORK_TYPES.find(t => t.toLowerCase() === text.toLowerCase()) || text; // Unknown values fail validation
};

// Build the fields to save from the request; `partial` allows leaving fields out (for edits)
function jobFields(body, partial) {
    const data = {};
    for (const field of ['postName', 'location', 'companyType']) {
        if (body[field] !== undefined || !partial) data[field] = clean(body[field]);
    }
    if (body.workType !== undefined || !partial) data.workType = normaliseWorkType(body.workType);
    if (body.salary !== undefined || !partial) {
        const salary = Number(body.salary);
        if (body.salary === '' || body.salary === null || Number.isNaN(salary)) {
            throw new HttpError(400, 'Salary must be a number');
        }
        data.salary = salary;
    }
    return data;
}

// Companies may only change their own posts; admins may change any post
async function findEditableJob(req) {
    if (!isValidId(req.params.id)) throw new HttpError(400, 'Invalid job post id');
    const job = await JobPost.findById(req.params.id);
    if (!job) throw new HttpError(404, 'Job post not found');
    if (req.user.role !== 'admin' && String(job.companyId) !== String(req.user._id)) {
        throw new HttpError(403, 'You can only change your own job posts');
    }
    return job;
}

// GET /api/job-posts  - all job posts (newest first)
router.get('/', asyncHandler(async (req, res) => {
    const jobPosts = await JobPost.find().sort({ createdAt: -1, _id: -1 });
    res.json(jobPosts);
}));

// GET /api/job-posts/mine  - the logged-in company's posts
router.get('/mine', requireRole('company'), asyncHandler(async (req, res) => {
    const jobPosts = await JobPost.find({ companyId: req.user._id }).sort({ createdAt: -1 });
    res.json(jobPosts);
}));

// POST /api/job-posts  - create a post for the logged-in company
router.post('/', requireRole('company'), asyncHandler(async (req, res) => {
    const job = await JobPost.create({
        ...jobFields(req.body, false),
        companyName: req.user.companyName,
        companyId: req.user._id,
    });
    res.status(201).json({ success: true, message: 'Job post created successfully!', jobPost: job });
}));

// PUT /api/job-posts/:id  - edit a post
router.put('/:id', requireRole('company', 'admin'), asyncHandler(async (req, res) => {
    const job = await findEditableJob(req);
    const data = jobFields(req.body, true);
    // Only admins may change the company name; companies always post under their own name
    if (req.user.role === 'admin' && req.body.companyName !== undefined) data.companyName = clean(req.body.companyName);
    job.set(data);
    await job.save();
    res.json({ success: true, message: 'Job post updated successfully', jobPost: job });
}));

// DELETE /api/job-posts/:id
router.delete('/:id', requireRole('company', 'admin'), asyncHandler(async (req, res) => {
    const job = await findEditableJob(req);
    await job.deleteOne();
    res.json({ success: true, message: 'Job post deleted successfully' });
}));

module.exports = router;
