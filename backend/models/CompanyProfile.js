const mongoose = require('mongoose');

// One profile per company account
const companyProfileSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, sparse: true },
    companyName: { type: String, required: [true, 'Company name is required'], trim: true },
    aboutCompany: { type: String, required: [true, 'Please describe the company'], trim: true },
}, { timestamps: true });

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
