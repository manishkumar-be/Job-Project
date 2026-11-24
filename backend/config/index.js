const crypto = require('crypto');

// Settings can be overridden with environment variables.
const config = {
    port: Number(process.env.PORT) || 8080,
    mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job_portal',
    // Secret used to sign login tokens. Set TOKEN_SECRET so users stay logged in
    // after a server restart; otherwise a new random secret is made on every start.
    tokenSecret: process.env.TOKEN_SECRET || crypto.randomBytes(32).toString('hex'),
    tokenLifetimeHours: 24,
    maxUploadBytes: 5 * 1024 * 1024, // 5 MB
};

module.exports = config;
