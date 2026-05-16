const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const Datastore = require('nedb');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- EMBEDDED DATABASE (nedb) ---------- //
const dbPath = path.join(__dirname, 'data');
require('fs').mkdirSync(dbPath, { recursive: true });

const db = {
    users:       new Datastore({ filename: path.join(dbPath, 'users.db'),       autoload: true }),
    profiles:    new Datastore({ filename: path.join(dbPath, 'profiles.db'),    autoload: true }),
    jobPosts:    new Datastore({ filename: path.join(dbPath, 'jobposts.db'),    autoload: true }),
    applications:new Datastore({ filename: path.join(dbPath, 'applications.db'),autoload: true }),
    help:        new Datastore({ filename: path.join(dbPath, 'help.db'),        autoload: true }),
    feedback:    new Datastore({ filename: path.join(dbPath, 'feedback.db'),    autoload: true }),
    companyProfiles: new Datastore({ filename: path.join(dbPath, 'companyprofiles.db'), autoload: true }),
    reviews:     new Datastore({ filename: path.join(dbPath, 'reviews.db'),     autoload: true }),
};

// Promisify nedb methods
function dbFind(datastore, query, sort) {
    return new Promise((resolve, reject) => {
        let cursor = datastore.find(query);
        if (sort) cursor = cursor.sort(sort);
        cursor.exec((err, docs) => err ? reject(err) : resolve(docs));
    });
}
function dbFindOne(datastore, query) {
    return new Promise((resolve, reject) =>
        datastore.findOne(query, (err, doc) => err ? reject(err) : resolve(doc)));
}
function dbInsert(datastore, doc) {
    return new Promise((resolve, reject) =>
        datastore.insert(doc, (err, newDoc) => err ? reject(err) : resolve(newDoc)));
}
function dbUpdate(datastore, query, update, options = {}) {
    return new Promise((resolve, reject) =>
        datastore.update(query, { $set: update }, options, (err, num, newDoc) => err ? reject(err) : resolve(newDoc || num)));
}
function dbRemove(datastore, query, options = {}) {
    return new Promise((resolve, reject) =>
        datastore.remove(query, options, (err, num) => err ? reject(err) : resolve(num)));
}
function dbCount(datastore, query = {}) {
    return new Promise((resolve, reject) =>
        datastore.count(query, (err, count) => err ? reject(err) : resolve(count)));
}

// ---------- DEMO SEED ---------- //
async function seedDemoData() {
    try {
        const demoUsers = [
            { email: 'seeker@demo.com', password: 'Demo@123', role: 'jobSeeker', companyName: null },
            { email: 'company@demo.com', password: 'Demo@123', role: 'company', companyName: 'TechCorp Solutions' },
            { email: 'admin@demo.com',   password: 'Demo@123', role: 'admin', companyName: null },
        ];

        for (const u of demoUsers) {
            const exists = await dbFindOne(db.users, { email: u.email });
            if (!exists) {
                const hashed = await bcrypt.hash(u.password, 10);
                await dbInsert(db.users, { ...u, password: hashed, createdAt: new Date() });
                console.log(`Demo user created: ${u.email}`);
            }
        }

        const jobCount = await dbCount(db.jobPosts);
        if (jobCount === 0) {
            const sampleJobs = [
                { postName: 'Frontend Developer', companyName: 'TechCorp Solutions', location: 'New York, NY', salary: 95000, companyType: 'IT', workType: 'hybrid', createdAt: new Date() },
                { postName: 'Backend Engineer', companyName: 'TechCorp Solutions', location: 'San Francisco, CA', salary: 115000, companyType: 'IT', workType: 'Online', createdAt: new Date() },
                { postName: 'Data Analyst', companyName: 'DataWorks Inc.', location: 'Chicago, IL', salary: 80000, companyType: 'IT', workType: 'offline', createdAt: new Date() },
                { postName: 'UI/UX Designer', companyName: 'Creative Studio', location: 'Austin, TX', salary: 75000, companyType: 'Design', workType: 'Online', createdAt: new Date() },
                { postName: 'DevOps Engineer', companyName: 'CloudBase Ltd.', location: 'Seattle, WA', salary: 125000, companyType: 'IT', workType: 'hybrid', createdAt: new Date() },
            ];
            for (const job of sampleJobs) await dbInsert(db.jobPosts, job);
            console.log('Demo job posts created');
        }

        const cpExists = await dbFindOne(db.companyProfiles, { companyName: 'TechCorp Solutions' });
        if (!cpExists) {
            await dbInsert(db.companyProfiles, {
                companyName: 'TechCorp Solutions',
                aboutCompany: 'TechCorp Solutions is a leading IT company specializing in web and mobile application development. We build innovative products that make a difference.',
                createdAt: new Date()
            });
            console.log('Demo company profile created');
        }

        const reviewCount = await dbCount(db.reviews);
        if (reviewCount === 0) {
            const sampleReviews = [
                { companyName: 'TechCorp Solutions', rating: 5, reason: 'Great work culture and excellent growth opportunities.', timestamp: new Date() },
                { companyName: 'TechCorp Solutions', rating: 4, reason: 'Good salary package and flexible work hours.', timestamp: new Date() },
                { companyName: 'DataWorks Inc.', rating: 3, reason: 'Average work-life balance but good pay.', timestamp: new Date() },
                { companyName: 'Creative Studio', rating: 5, reason: 'Amazing team and creative environment.', timestamp: new Date() },
            ];
            for (const r of sampleReviews) await dbInsert(db.reviews, r);
            console.log('Demo reviews created');
        }

        console.log('Demo data ready!');
    } catch (err) {
        console.error('Error seeding demo data:', err);
    }
}

// ---------- AUTH ROUTES ---------- //

app.post('/register', async (req, res) => {
    try {
        const { email, password, registerType, companyName } = req.body;
        const existingUser = await dbFindOne(db.users, { email });
        if (existingUser) return res.status(400).json({ success: false, message: 'User already exists with this email.' });
        const hashedPassword = await bcrypt.hash(password, 10);
        await dbInsert(db.users, { email, password: hashedPassword, role: registerType, companyName: companyName || null, createdAt: new Date() });
        res.json({ success: true, message: 'Registration successful! Please login.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed.', error: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password, userType } = req.body;
        const user = await dbFindOne(db.users, { email, role: userType });
        if (!user) return res.json({ success: false, message: 'Invalid credentials. Please try again.' });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.json({ success: false, message: 'Invalid credentials. Please try again.' });
        const redirectMap = { jobSeeker: 'jobseeker.html', company: 'company.html', admin: 'admin.html' };
        const redirectTo = redirectMap[userType] || `${userType}.html`;
        res.json({ success: true, redirectTo: `/${redirectTo}`, companyName: user.companyName || '' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login failed.', error: error.message });
    }
});

// ---------- JOB PROFILE ---------- //
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

app.post('/jobprofile', upload.fields([
    { name: 'certificate', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
]), async (req, res) => {
    try {
        const { name, gender, dob } = req.body;
        const mobileNumbers = [].concat(req.body['mobileNumbers[]'] || req.body.mobileNumbers || []);
        const emails = [].concat(req.body['emails[]'] || req.body.emails || []);
        const educationLevels = [].concat(req.body['educationLevels[]'] || req.body.educationLevels || []);
        const institutions = [].concat(req.body['institution[]'] || req.body.institution || []);
        const percentages = [].concat(req.body['percentage[]'] || req.body.percentage || []);
        const passingYears = [].concat(req.body['passingYear[]'] || req.body.passingYear || []);
        const skills = [].concat(req.body['skills[]'] || req.body.skills || []);
        const projects = [].concat(req.body['projects[]'] || req.body.projects || []);

        const education = educationLevels.map((level, i) => ({
            educationLevel: level,
            institution: institutions[i] || '',
            percentage: percentages[i] || '',
            passingYear: passingYears[i] || '',
        }));

        const profile = {
            name, gender, dob,
            mobileNumbers, emails, education, skills, projects,
            certificate: req.files?.certificate?.[0]?.path || null,
            resume: req.files?.resume?.[0]?.path || null,
            createdAt: new Date(),
        };
        await dbInsert(db.profiles, profile);
        res.json({ success: true, message: 'Profile saved successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving profile.', error: error.message });
    }
});

// ---------- JOB POSTS ---------- //

app.get('/job-posts', async (req, res) => {
    try {
        const jobPosts = await dbFind(db.jobPosts, {}, { createdAt: -1 });
        res.json(jobPosts.map(j => ({ ...j, _id: j._id })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job posts.', error: error.message });
    }
});

app.post('/job-posts', async (req, res) => {
    try {
        const { postName, companyName, location, salary, companyType, workType } = req.body;
        const newJob = await dbInsert(db.jobPosts, { postName, companyName, location, salary: Number(salary), companyType, workType, createdAt: new Date() });
        res.json({ message: 'Job post created successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating job post.', error: error.message });
    }
});

app.put('/job-posts/:id', async (req, res) => {
    try {
        const { postName, companyName, location, salary, companyType, workType } = req.body;
        await dbUpdate(db.jobPosts, { _id: req.params.id }, { postName, companyName, location, salary: Number(salary), companyType, workType });
        res.json({ message: 'Job post updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating job post.', error: error.message });
    }
});

app.delete('/job-posts/:id', async (req, res) => {
    try {
        const removed = await dbRemove(db.jobPosts, { _id: req.params.id });
        if (removed === 0) return res.status(404).json({ message: 'Job post not found.' });
        res.json({ message: 'Job post deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting job post.', error: error.message });
    }
});

// ---------- APPLICATIONS ---------- //

app.get('/applications', async (req, res) => {
    try {
        const applications = await dbFind(db.applications, {}, { createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications.', error: error.message });
    }
});

app.post('/submitApplication', upload.single('resume'), async (req, res) => {
    try {
        const applicationData = JSON.parse(req.body.application);
        if (!req.file) return res.status(400).json({ message: 'Resume file is required.' });
        await dbInsert(db.applications, {
            jobId: applicationData.jobId,
            name: applicationData.name,
            phone: applicationData.phone,
            email: applicationData.email,
            resume: req.file.path,
            status: 'Pending',
            createdAt: new Date(),
        });
        res.json({ message: 'Application submitted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting application.', error: error.message });
    }
});

app.put('/applications/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await dbUpdate(db.applications, { _id: req.params.id }, { status });
        res.json({ message: `Application ${status} successfully.` });
    } catch (error) {
        res.status(500).json({ message: 'Error updating application.', error: error.message });
    }
});

app.get('/application-tracked', async (req, res) => {
    try {
        const applications = await dbFind(db.applications, {}, { createdAt: -1 });
        const mapped = await Promise.all(applications.map(async (app) => {
            let jobTitle = 'Unknown';
            let companyName = 'Unknown';
            if (app.jobId) {
                const job = await dbFindOne(db.jobPosts, { _id: app.jobId });
                if (job) { jobTitle = job.postName; companyName = job.companyName; }
            }
            return { _id: app._id, applicantName: app.name, email: app.email, jobPost: jobTitle, company: companyName, status: app.status || 'Pending' };
        }));
        res.json(mapped);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tracked applications.', error: error.message });
    }
});

// ---------- COMPANY PROFILE ---------- //

app.get('/company/profile', async (req, res) => {
    try {
        const query = req.query.companyName ? { companyName: req.query.companyName } : {};
        const profile = await dbFindOne(db.companyProfiles, query);
        if (profile) return res.json(profile);
        res.status(404).json({ message: 'No company profile found.' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching company profile.', error: error.message });
    }
});

app.get('/companyprofiles', async (req, res) => {
    try {
        const query = req.query.companyName ? { companyName: req.query.companyName } : {};
        const profile = await dbFindOne(db.companyProfiles, query);
        if (profile) return res.json(profile);
        res.status(404).json({ message: 'No company profile found.' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching company profile.', error: error.message });
    }
});

app.post('/company/profile', async (req, res) => {
    try {
        const { companyName, aboutCompany } = req.body;
        if (!companyName || !aboutCompany) return res.status(400).json({ success: false, message: 'Company name and about are required.' });
        const existing = await dbFindOne(db.companyProfiles, { companyName });
        if (existing) {
            await dbUpdate(db.companyProfiles, { companyName }, { aboutCompany });
            return res.json({ success: true, message: 'Company profile updated successfully!' });
        }
        await dbInsert(db.companyProfiles, { companyName, aboutCompany, createdAt: new Date() });
        res.json({ success: true, message: 'Company profile saved successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving company profile.', error: error.message });
    }
});

// ---------- REVIEWS ---------- //

app.get('/companyreviews', async (req, res) => {
    try {
        const reviews = await dbFind(db.reviews, {}, { timestamp: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews.', error: error.message });
    }
});

app.get('/reviews/:company', async (req, res) => {
    try {
        const reviews = await dbFind(db.reviews, { companyName: req.params.company }, { timestamp: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews.', error: error.message });
    }
});

app.post('/reviews', async (req, res) => {
    try {
        const { companyName, rating, reason } = req.body;
        if (!companyName || !rating) return res.status(400).json({ success: false, message: 'Company name and rating are required.' });
        await dbInsert(db.reviews, { companyName, rating: Number(rating), reason, timestamp: new Date() });
        res.json({ success: true, message: 'Review submitted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error submitting review.', error: error.message });
    }
});

// ---------- FEEDBACK ---------- //

app.get('/feedback', async (req, res) => {
    try {
        const feedbackList = await dbFind(db.feedback, {}, { date: -1 });
        res.json(feedbackList);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feedback.', error: error.message });
    }
});

app.post('/feedback', async (req, res) => {
    try {
        const { userEmail, message } = req.body;
        if (!userEmail || !message) return res.status(400).json({ success: false, message: 'Email and message are required.' });
        await dbInsert(db.feedback, { userEmail, message, date: new Date() });
        res.json({ success: true, message: 'Feedback submitted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving feedback.', error: error.message });
    }
});

// ---------- HELP ---------- //

app.get('/help', async (req, res) => {
    try {
        const helpRequests = await dbFind(db.help, {}, { date: -1 });
        res.json(helpRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching help requests.', error: error.message });
    }
});

app.post('/help', async (req, res) => {
    try {
        const { userEmail, issue } = req.body;
        if (!userEmail || !issue) return res.status(400).json({ success: false, message: 'Email and issue are required.' });
        await dbInsert(db.help, { userEmail, issue, date: new Date(), resolved: false });
        res.json({ success: true, message: 'Help request submitted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error submitting help request.', error: error.message });
    }
});

app.patch('/help/resolve/:id', async (req, res) => {
    try {
        await dbUpdate(db.help, { _id: req.params.id }, { resolved: true });
        res.json({ message: 'Help request marked as resolved.' });
    } catch (error) {
        res.status(500).json({ message: 'Error resolving help request.', error: error.message });
    }
});

app.delete('/help/:id', async (req, res) => {
    try {
        const removed = await dbRemove(db.help, { _id: req.params.id });
        if (removed === 0) return res.status(404).json({ message: 'Help request not found.' });
        res.json({ message: 'Help request deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting help request.', error: error.message });
    }
});

// ---------- USERS ---------- //

app.get('/users', async (req, res) => {
    try {
        const users = await dbFind(db.users, {}, { createdAt: -1 });
        res.json(users.map(u => ({ _id: u._id, email: u.email, role: u.role, companyName: u.companyName, createdAt: u.createdAt })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users.', error: error.message });
    }
});

app.put('/users/:id', async (req, res) => {
    try {
        const { email, role, companyName } = req.body;
        await dbUpdate(db.users, { _id: req.params.id }, { email, role, companyName });
        res.json({ message: 'User updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user.', error: error.message });
    }
});

app.delete('/users/:id', async (req, res) => {
    try {
        const removed = await dbRemove(db.users, { _id: req.params.id });
        if (removed === 0) return res.status(404).json({ message: 'User not found.' });
        res.json({ message: 'User deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user.', error: error.message });
    }
});

// ---------- START ---------- //
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    seedDemoData();
});
