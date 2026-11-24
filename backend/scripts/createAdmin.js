// Creates an admin account (sign-up only offers job seeker and company accounts).
// Usage, from the backend folder:  npm run create-admin -- admin@example.com yourPassword
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function main() {
    const [email, password] = process.argv.slice(2);
    if (!email || !password || password.length < 6) {
        console.log('Usage: npm run create-admin -- <email> <password (6+ characters)>');
        process.exit(1);
    }

    await connectDB();
    const normalised = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalised }).collation({ locale: 'en', strength: 2 });
    const hash = await bcrypt.hash(password, 10);

    if (existing) {
        existing.role = 'admin';
        existing.password = hash;
        existing.companyName = undefined;
        await existing.save();
        console.log(`Existing account ${normalised} is now an admin with the new password.`);
    } else {
        await User.create({ email: normalised, password: hash, role: 'admin' });
        console.log(`Admin account ${normalised} created.`);
    }
    await mongoose.disconnect();
}

main().catch(err => {
    console.error('Failed to create admin:', err.message);
    process.exit(1);
});
