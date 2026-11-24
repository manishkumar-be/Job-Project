const mongoose = require('mongoose');

const helpSchema = new mongoose.Schema({
    userEmail: { type: String, required: true, trim: true, lowercase: true },
    issue: { type: String, required: [true, 'Please describe the issue'], trim: true },
    date: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
});

module.exports = mongoose.model('Help', helpSchema);
