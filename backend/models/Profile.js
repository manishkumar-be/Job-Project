const mongoose = require('mongoose');

// Job seeker profile: one per user
const profileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, sparse: true },
    name: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'third'] },
    dob: Date,
    mobileNumbers: [String],
    emails: [String],
    education: [{
        educationLevel: String,
        institution: String,
        percentage: String, // Text, so values like "85%" or "8.2 CGPA" are allowed
        passingYear: String,
    }],
    skills: [String],
    projects: [String],
    certificate: String, // URL of the uploaded certificate
    resume: String,      // URL of the uploaded resume
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
