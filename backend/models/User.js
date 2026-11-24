const mongoose = require('mongoose');

const ROLES = ['jobSeeker', 'company', 'admin'];

const userSchema = new mongoose.Schema({
    email: { type: String, required: [true, 'Email is required'], trim: true, lowercase: true },
    password: { type: String, required: true }, // bcrypt hash, never the plain password
    role: { type: String, required: true, enum: { values: ROLES, message: 'Role must be jobSeeker, company or admin' } },
    companyName: { type: String, trim: true }, // Only for companies
}, { timestamps: true });

// Never send the password hash to the browser
userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        return ret;
    },
});

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
