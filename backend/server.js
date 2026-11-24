// Job Portal server. From the backend folder run `npm install` once, then `npm start`,
// and open http://localhost:8080
const path = require('path');
const express = require('express');
const cors = require('cors');
const config = require('./config');
const connectDB = require('./config/db');
const { UPLOAD_DIR } = require('./middleware/upload');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const FRONTEND = path.join(__dirname, '..', 'frontend');

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Frontend: pages from frontend/html at the site root, plus /css, /js and uploaded files
app.use(express.static(path.join(FRONTEND, 'html')));
app.use('/css', express.static(path.join(FRONTEND, 'css')));
app.use('/js', express.static(path.join(FRONTEND, 'js')));
app.use('/uploads', express.static(UPLOAD_DIR));
app.get('/', (req, res) => res.redirect('/login.html'));

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
    if (!process.env.TOKEN_SECRET) {
        console.warn('Note: TOKEN_SECRET is not set, so everyone must log in again after a server restart.');
    }
    try {
        await connectDB();
    } catch (err) {
        console.error('Could not connect to MongoDB. Is it running?', err.message);
        process.exit(1);
    }
    app.listen(config.port, () => console.log(`Job Portal running at http://localhost:${config.port}`));
}

if (require.main === module) start();

module.exports = app; // Exported for tests
