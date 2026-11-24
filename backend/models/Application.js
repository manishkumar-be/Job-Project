const mongoose = require('mongoose');

const STATUSES = ['Pending', 'Accepted', 'Rejected'];

const applicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPost', required: true },
    seekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    phone: { type: String, required: [true, 'Mobile number is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], trim: true, lowercase: true },
    resume: { type: String, required: true }, // URL of the uploaded resume
    status: { type: String, enum: STATUSES, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
module.exports.STATUSES = STATUSES;
