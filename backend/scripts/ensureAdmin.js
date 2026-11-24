// Creates the admin account given by ADMIN_EMAIL / ADMIN_PASSWORD if it does not exist yet.
// Used on startup so a hosted site can get an admin without shell access.
// An existing account is never changed, so the password set later stays in place.
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { adminEmail, adminPassword } = require('../config');

async function ensureAdmin() {
    if (!adminEmail && !adminPassword) return;
    if (!adminEmail || adminPassword.length < 6) {
        console.warn('ADMIN_EMAIL and ADMIN_PASSWORD (6+ characters) must both be set to create the admin account.');
        return;
    }
    const existing = await User.findOne({ email: adminEmail }).collation({ locale: 'en', strength: 2 });
    if (existing) {
        if (existing.role !== 'admin') {
            console.warn(`ADMIN_EMAIL ${adminEmail} belongs to a ${existing.role} account, so no admin was created.`);
        }
        return;
    }
    await User.create({ email: adminEmail, password: await bcrypt.hash(adminPassword, 10), role: 'admin' });
    console.log(`Admin account ${adminEmail} created.`);
}

module.exports = ensureAdmin;
