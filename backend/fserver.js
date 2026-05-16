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
});
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
            percentage: Number,
            passingYear: Number,
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
    jobId: String,
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
        // cb(null, `${Date.now()}-${file.originalname}`);
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
    res.json({ message: 'Registration successful' });
});

// app.post('/login', async (req, res) => {
//     const { email, password, userType } = req.body;
//     const user = await User.findOne({ email, role: userType });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//         return res.status(400).json({ message: 'Invalid credentials' });
//     }
//     // res.json({ message: 'Login successful', redirectTo: `/${userType}.html` });
//     res.json({ message: 'Login successful', redirectTo: `/job.html` });
// });

// Profile Routes
app.post('/jobprofile', upload.fields([
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
            certificate: req.files.certificate?.[0]?.path || null,
            resume: req.files.resume?.[0]?.path || null,
        });
        await profile.save();
        res.json({ message: 'Profile saved successfully', profile });
    } catch (error) {
        res.status(500).json({ message: 'Error saving profile', error });
    }
});


// // Job Post Routes
// app.get('/job-posts', async (req, res) => {
//     const jobPosts = await JobPost.find();
//     res.json(jobPosts);
// });

// app.post('/job-posts', async (req, res) => {
//     const job = new JobPost(req.body);
//     await job.save();
//     res.json({ message: 'Job post created successfully!' });
// });

// // Application Routes
// app.post('/submitApplication', upload.single('resume'), async (req, res) => {
//     const applicationData = JSON.parse(req.body.application);
//     const application = new Application({ ...applicationData, resume: req.file.path });
//     await application.save();
//     res.json({ message: 'Application submitted successfully!' });
// });

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


// Company Review Routes
app.get('/companyreviews', async (req, res) => {
    try {
        const reviews = await CompanyReview.find().sort({ timestamp: -1 }); // Sort by latest
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching company reviews', error });
    }
});


// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password, userType } = req.body;

    // Find the user by email and role
    const user = await User.findOne({ email: email, role: userType });
    if (!user) {
        return res.json({ success: false, message: "Please enter your credentials again" });
    }

    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.json({ success: false, message: "Please enter your credentials again" });
    }

    // Successful login
    res.json({ success: true, redirectTo: `/${userType}.html` });
});

//entry feedback
app.post('/feedback', (req, res) => {
    const newFeedback = req.body;

    fs.readFile('feedbacks.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading feedbacks file.' });
        }

        const feedbacks = JSON.parse(data);
        feedbacks.push(newFeedback);

        fs.writeFile('feedbacks.json', JSON.stringify(feedbacks, null, 2), err => {
            if (err) {
                return res.status(500).json({ message: 'Error saving feedback.' });
            }
            res.json({ message: 'Feedback submitted successfully!' });
        });
    });
});

// Fetch all applications
app.get('/applications', async (req, res) => {
    try {
        // Populate 'jobId' only if it's a reference to another model
        const applications = await Application.find().populate("jobId"); 
        res.json(applications);
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ message: "Error fetching applications", error });
    }
});

// Submit a new application
app.post('/submitApplication', upload.single('resume'), async (req, res) => {
    try {
        // Parse the application data from the request body
        const applicationData = JSON.parse(req.body.application);

        // Check if a resume file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: "Resume file is required." });
        }

        // Create a new application instance
        const newApplication = new Application({
            jobId: applicationData.jobId,
            name: applicationData.name,
            phone: applicationData.phone,
            email: applicationData.email,
            resume: req.file.path, // Save the path of the uploaded resume
        });

        // Save the application to the database
        await newApplication.save();
        res.json({ message: 'Application submitted successfully!' });
    } catch (error) {
        console.error("Error submitting application:", error);

        // Handle JSON parsing errors
        if (error instanceof SyntaxError) {
            return res.status(400).json({ message: "Invalid application data format.", error });
        }

        // Catch all other errors
        res.status(500).json({ message: "Error submitting application", error });
    }
});



// Job Post Routes
app.get('/job-posts', async (req, res) => {
    try {
        const jobPosts = await JobPost.find();
        res.json(jobPosts); // Return all job posts
    } catch (error) {
        console.error("Error fetching job posts:", error);
        res.status(500).json({ message: 'Error fetching job posts', error });
    }
});

app.post('/job-posts', async (req, res) => {
    const { postName, companyName, location, salary } = req.body;
    try {
        const newJobPost = new JobPost({ postName, companyName, location, salary });
        await newJobPost.save();
        res.json({ message: 'Job post created successfully!' }); // Return success message
    } catch (error) {
        console.error('Error creating job post:', error);
        res.status(500).json({ message: 'Error creating job post', error });
    }
});

app.delete('/job-posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedJobPost = await JobPost.findByIdAndDelete(id);
        if (!deletedJobPost) {
            return res.status(404).json({ message: 'Job post not found' }); // Job post not found
        }
        res.json({ message: 'Job post deleted successfully' }); // Return success message
    } catch (error) {
        console.error('Error deleting job post:', error);
        res.status(500).json({ message: 'Error deleting job post', error });
    }
});

app.put('/job-posts/:id', async (req, res) => {
    const { id } = req.params;
    const { postName, companyName, location, salary } = req.body;

    try {
        const updatedJobPost = await JobPost.findByIdAndUpdate(id, { postName, companyName, location, salary }, { new: true });
        if (!updatedJobPost) {
            return res.status(404).json({ message: 'Job post not found' }); // Job post not found
        }
        res.json({ message: 'Job post updated successfully', jobPost: updatedJobPost }); // Return success message
    } catch (error) {
        console.error('Error updating job post:', error);
        res.status(500).json({ message: 'Error updating job post', error });
    }
});


// ---------- SERVER ---------- //
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

