const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

// Settings are read in this order; the first place that sets a value wins:
//   1. the hosting site's environment settings (or variables set in the terminal)
//   2. backend/.env.local  - private values (e.g. your Atlas MONGO_URI), never uploaded to GitHub
//   3. backend/.env        - shared example values, kept on GitHub
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Example values from the public backend/.env. Anyone can read them on GitHub,
// so they must never protect a site that is online.
const PUBLIC_EXAMPLE_SECRET = 'change-me-local-development-secret';
const PUBLIC_EXAMPLE_ADMIN_PASSWORD = 'admin123';

const env = process.env;

// Hosting sites set NODE_ENV=production (render.yaml and the Dockerfile do this)
const isProduction = env.NODE_ENV === 'production';

// One database setting for every environment: the same code works with MongoDB on
// your computer or one shared online database (MongoDB Atlas).
const mongoUri = (env.MONGO_URI || 'mongodb://127.0.0.1:27017/job_portal').trim();

// Is the database on this computer? Only then may the public example admin be created,
// otherwise it would land in a shared database that a hosted site also uses.
const isLocalDatabase = (() => {
    const match = mongoUri.match(/^mongodb(?:\+srv)?:\/\/(?:[^@/]*@)?([^/?]+)/);
    if (!match) return false;
    const hosts = match[1].split(',').map(h => h.replace(/:\d+$/, '').replace(/^\[|\]$/g, '').toLowerCase());
    return hosts.every(h => ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(h));
})();

const warnings = [];

let tokenSecret = env.TOKEN_SECRET || '';
if (isProduction && tokenSecret === PUBLIC_EXAMPLE_SECRET) {
    warnings.push('TOKEN_SECRET is still the public example value, so a temporary secret is used instead (everyone is logged out on restart). Set your own secret in .env.local or the hosting settings.');
    tokenSecret = '';
} else if (!tokenSecret) {
    warnings.push('No TOKEN_SECRET set: a temporary one is used, so everyone is logged out when the server restarts.');
}
const hasTokenSecret = Boolean(tokenSecret);
if (!hasTokenSecret) tokenSecret = crypto.randomBytes(32).toString('hex');

let adminPassword = env.ADMIN_PASSWORD || '';
if (adminPassword === PUBLIC_EXAMPLE_ADMIN_PASSWORD && (isProduction || !isLocalDatabase)) {
    warnings.push('ADMIN_PASSWORD is still the public example value, so no admin account is created in this database (it is not on this computer). Set your own password in .env.local or the hosting settings.');
    adminPassword = '';
}

const config = {
    isProduction,
    isLocalDatabase,
    port: Number(env.PORT) || 8080,
    mongoUri,
    tokenSecret,
    hasTokenSecret,
    tokenLifetimeHours: Number(env.TOKEN_LIFETIME_HOURS) || 24,
    maxUploadBytes: (Number(env.MAX_UPLOAD_MB) || 5) * 1024 * 1024,
    uploadDir: env.UPLOAD_DIR ? path.resolve(env.UPLOAD_DIR) : path.join(__dirname, '..', 'uploads'),
    // Other websites allowed to call the API. Empty is normal: this server also serves the pages.
    corsOrigins: (env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
    // Admin account created on startup if it does not exist yet
    adminEmail: (env.ADMIN_EMAIL || '').trim().toLowerCase(),
    adminPassword,
    warnings,
};

module.exports = config;
