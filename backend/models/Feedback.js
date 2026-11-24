const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userEmail: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: [true, 'Feedback cannot be empty'], trim: true },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
