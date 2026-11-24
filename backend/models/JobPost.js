const mongoose = require('mongoose');

const WORK_TYPES = ['Online', 'Offline', 'Hybrid'];

const jobPostSchema = new mongoose.Schema({
    postName: { type: String, required: [true, 'Post name is required'], trim: true },
    companyName: { type: String, required: [true, 'Company name is required'], trim: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Company account that owns the post
    location: { type: String, required: [true, 'Location is required'], trim: true },
    salary: { type: Number, required: [true, 'Salary is required'], min: [0, 'Salary cannot be negative'] },
    companyType: { type: String, trim: true },
    workType: { type: String, enum: { values: WORK_TYPES, message: 'Work type must be Online, Offline or Hybrid' } },
}, { timestamps: true });

module.exports = mongoose.model('JobPost', jobPostSchema);
module.exports.WORK_TYPES = WORK_TYPES;
