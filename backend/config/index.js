const path = require('path');
const crypto = require('crypto');

// Load settings from backend/.env (if the file exists). Variables already set by
// the hosting platform take priority over the file.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const isProduction = process.env.NODE_ENV === 'production';

const config = {
    isProduction,
    port: Number(process.env.PORT) || 8080,
    mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job_portal',
    // Signs login tokens. Without it a random secret is made on every start,
    // which logs everyone out whenever the server restarts.
    tokenSecret: process.env.TOKEN_SECRET || crypto.randomBytes(32).toString('hex'),
    hasTokenSecret: Boolean(process.env.TOKEN_SECRET),
    tokenLifetimeHours: Number(process.env.TOKEN_LIFETIME_HOURS) || 24,
    maxUploadBytes: (Number(process.env.MAX_UPLOAD_MB) || 5) * 1024 * 1024,
    uploadDir: process.env.UPLOAD_DIR
        ? path.resolve(process.env.UPLOAD_DIR)
        : path.join(__dirname, '..', 'uploads'),
    // Comma-separated list of sites allowed to call the API from another address.
    // Leave empty when the frontend is served by this server (the normal setup).
    corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
    // Optional: admin account created on startup if it does not exist yet
    adminEmail: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    adminPassword: process.env.ADMIN_PASSWORD || '',
};

module.exports = config;
