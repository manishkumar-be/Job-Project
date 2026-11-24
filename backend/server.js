// Job Portal server. From the backend folder run `npm install` once, then `npm start`,
// and open http://localhost:8080 (settings: backend/.env, private values in backend/.env.local)
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config');
const connectDB = require('./config/db');
const ensureAdmin = require('./scripts/ensureAdmin');
const { UPLOAD_DIR } = require('./middleware/upload');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const FRONTEND = path.join(__dirname, '..', 'frontend');

// Hosting platforms put a proxy in front of the app; trust it for the client's address
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Basic security headers
app.use((req, res, next) => {
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'same-origin',
    });
    next();
});

// The frontend is served by this server, so cross-site calls are only needed for
// extra sites listed in CORS_ORIGINS (or any site while developing locally).
app.use(cors({ origin: config.corsOrigins.length ? config.corsOrigins : !config.isProduction }));
app.use(express.json({ limit: '1mb' }));

// Frontend: pages from frontend/html at the site root, plus /css, /js and uploaded files
app.use(express.static(path.join(FRONTEND, 'html')));
app.use('/css', express.static(path.join(FRONTEND, 'css')));
app.use('/js', express.static(path.join(FRONTEND, 'js')));
app.use('/uploads', express.static(UPLOAD_DIR));
app.get('/', (req, res) => res.redirect('/login.html'));

// Health check for the hosting platform
app.get('/api/health', (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.status(dbConnected ? 200 : 503).json({ success: dbConnected, database: dbConnected ? 'connected' : 'disconnected' });
});

// API
app.use('/api', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/job-posts', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/company', require('./routes/company'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/help', require('./routes/help'));
app.use('/api/users', require('./routes/users'));
app.use('/api', notFound);

app.use(errorHandler);

async function start() {
    console.log(`Starting (${config.isProduction ? 'production' : 'development'}, ${config.isLocalDatabase ? 'database on this computer' : 'online database'})`);
    config.warnings.forEach(message => console.warn(`Warning: ${message}`));
    try {
        await connectDB();
    } catch (err) {
        console.error('Could not connect to MongoDB. Check MONGO_URI and that the database is running.', err.message);
        process.exit(1);
    }
    try {
        await ensureAdmin();
    } catch (err) {
        console.error('Could not create the admin account:', err.message);
    }
    // 0.0.0.0 so the hosting platform can reach the app
    app.listen(config.port, '0.0.0.0', () => console.log(`Job Portal running on port ${config.port}`));
}

if (require.main === module) start();

module.exports = app; // Exported for tests
