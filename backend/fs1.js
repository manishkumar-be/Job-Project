const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/job_portal', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB successfully');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// ---------- SCHEMAS & MODELS ---------- //

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    companyName: { type: String }, // Only applicable for companies
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt
const User = mongoose.model('User', userSchema);

// Profile Schema
const profileSchema = new mongoose.Schema({
    name: String,
    gender: String,
    dob: Date,
    mobileNumbers: [String],
    emails: [String],
    education: [
        {
            educationLevel: String,
            institution: String,
            percentage: String,
            passingYear: String,
        },
    ],
    skills: [String],
    projects: [String],
    certificate: String, // Path to uploaded certificate
    resume: String,      // Path to uploaded resume
});
const Profile = mongoose.model('Profile', profileSchema);

// Job Post Schema
const jobPostSchema = new mongoose.Schema({
    postName: String,
    companyName: String,
    location: String,
    salary: Number,
    companyType: String,
    workType: String,
});
const JobPost = mongoose.model('JobPost', jobPostSchema);

// Application Schema
const applicationSchema = new mongoose.Schema({
    jobId: Number,
    name: String,
    phone: String,
    email: String,
    resume: String,
});
const Application = mongoose.model('Application', applicationSchema);

// Help Schema
const helpSchema = new mongoose.Schema({
    userEmail: String,
    issue: String,
    date: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
});
const Help = mongoose.model('Help', helpSchema);

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
    userEmail: String,
    message: String,
    date: { type: Date, default: Date.now },
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Company Profile Schema
const companyProfileSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    aboutCompany: { type: String, required: true },
});
const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);

// Company Review Schema
const companyReviewSchema = new mongoose.Schema({
    companyName: String,
    rating: Number,
    reason: String,
    timestamp: { type: Date, default: Date.now },
});
const CompanyReview = mongoose.model('CompanyReview', companyReviewSchema);

// ---------- MULTER SETUP ---------- //
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// ---------- ROUTES ---------- //

// Auth Routes
app.post('/register', async (req, res) => {
    const { email, password, registerType, companyName } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role: registerType, companyName });
    await newUser.save();
    res.json({ message: 'Registration successful', success: true });
});

app.post('/login', async (req, res) => {
    const { email, password, userType } = req.body;
    const user = await User.findOne({ email, role: userType });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful', redirectTo: `/${userType}.html` });
});

// Profile Routes
app.post('/saveProfile', upload.fields([
    { name: 'certificate', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
]), async (req, res) => {
    try {
        const { name, gender, dob, mobileNumbers, emails, educationLevels, institution, percentage, passingYear, skills, projects } = req.body;
        const education = educationLevels.map((level, i) => ({
            educationLevel: level,
            institution: institution[i],
            percentage: percentage[i],
            passingYear: passingYear[i],
        }));
        const profile = new Profile({
            name,
            gender,
            dob,
            mobileNumbers: [].concat(mobileNumbers),
            emails: [].concat(emails),
            education,
            skills: [].concat(skills),
            projects: [].concat(projects),
            certificate: req.files.certificate?.[0].path || null,
            resume: req.files.resume?.[0].path || null,
        });
        await profile.save();
        res.json({ message: 'Profile saved successfully', profile });
    } catch (error) {
        res.status(500).json({ message: 'Error saving profile', error });
    }
});

// Job Post Routes
app.get('/job-posts', async (req, res) => {
    const jobPosts = await JobPost.find();
    res.json(jobPosts);
});

app.post('/job-posts', async (req, res) => {
    const job = new JobPost(req.body);
    await job.save();
    res.json({ message: 'Job post created successfully!' });
});

// Application Routes
app.post('/submitApplication', upload.single('resume'), async (req, res) => {
    const applicationData = JSON.parse(req.body.application);
    const application = new Application({ ...applicationData, resume: req.file.path });
    await application.save();
    res.json({ message: 'Application submitted successfully!' });
});

// Help Routes
app.get('/help', async (req, res) => {
    const helpRequests = await Help.find();
    res.json(helpRequests);
});

// Feedback Routes
app.get('/feedback', async (req, res) => {
    const feedbackList = await Feedback.find().sort({ date: -1 });
    res.json(feedbackList);
});

// Company Profile Routes
app.get('/company/profile', async (req, res) => {
    const profile = await CompanyProfile.findOne();
    if (profile) return res.json(profile);
    res.status(404).json({ message: 'No company profile found.' });
});

// Company Review Routes
app.get('/reviews/:company', async (req, res) => {
    const { company } = req.params;
    const reviews = await CompanyReview.find({ companyName: company }).sort({ timestamp: -1 });
    res.json(reviews);
});

// ---------- USER MANAGEMENT ROUTES ---------- //

// Get all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 }); // Exclude passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

// Delete a user
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
});

// Update a user (optional)
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { email, role, companyName } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(id, { email, role, companyName }, { new: true });
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
});

// ---------- SERVER ---------- //
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
