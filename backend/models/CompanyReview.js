const mongoose = require('mongoose');

const companyReviewSchema = new mongoose.Schema({
    companyName: { type: String, required: [true, 'Company name is required'], trim: true },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be between 1 and 10'],
        max: [10, 'Rating must be between 1 and 10'],
    },
    reason: { type: String, required: [true, 'Please give a reason'], trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CompanyReview', companyReviewSchema);
