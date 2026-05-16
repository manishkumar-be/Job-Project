const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const path = require('path');

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/JobPortal", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB connected");
}).catch(err => {
    console.error("Error connecting to MongoDB:", err);
});

// Define Schemas
const companyProfileSchema = new mongoose.Schema({
    companyName: String,
    about: String,
    todoList: [String]
});

const jobPostSchema = new mongoose.Schema({
    companyName: String,
    postName: String,
    location: String,
    salary: Number,
    companyType: String,
    workType: String
});

const applicationSchema = new mongoose.Schema({
    jobId: mongoose.Schema.Types.ObjectId,
    seekerName: String,
    seekerEmail: String,
    status: String // "Pending", "Selected", "Rejected"
});

const trackedApplicationSchema = new mongoose.Schema({
    jobId: mongoose.Schema.Types.ObjectId,
    seekerId: mongoose.Schema.Types.ObjectId,
    status: String
});

// Define Models
const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);
const JobPost = mongoose.model('JobPost', jobPostSchema);
const Application = mongoose.model('Application', applicationSchema);
const TrackedApplication = mongoose.model('TrackedApplication', trackedApplicationSchema);

// Routes for Profile
app.post('/company/profile', async (req, res) => {
    const { companyName, about, todoList } = req.body;

    const profile = await CompanyProfile.findOne({ companyName });

    if (profile) {
        await CompanyProfile.updateOne({ companyName }, { about, todoList });
        return res.json({ success: true, message: "Profile updated successfully" });
    }

    const newProfile = new CompanyProfile({ companyName, about, todoList });
    await newProfile.save();
    res.json({ success: true, message: "Profile created successfully" });
});

app.get('/company/profile', async (req, res) => {
    const profiles = await CompanyProfile.find();
    res.json(profiles);
});

// Routes for Job Post
app.post('/company/job', async (req, res) => {
    const { companyName, postName, location, salary, companyType, workType } = req.body;

    const newJobPost = new JobPost({ companyName, postName, location, salary, companyType, workType });
    await newJobPost.save();
    res.json({ success: true, message: "Job post created successfully" });
});

app.get('/company/job', async (req, res) => {
    const jobs = await JobPost.find();
    res.json(jobs);
});

app.delete('/company/job/:id', async (req, res) => {
    const { id } = req.params;
    await JobPost.findByIdAndDelete(id);
    res.json({ success: true, message: "Job post deleted successfully" });
});

// Routes for Applications
app.get('/company/applications', async (req, res) => {
    const applications = await Application.find();
    res.json(applications);
});

app.post('/company/applications', async (req, res) => {
    const { jobId, seekerName, seekerEmail, status } = req.body;

    const newApplication = new Application({ jobId, seekerName, seekerEmail, status });
    await newApplication.save();
    res.json({ success: true, message: "Application submitted successfully" });
});

// Routes for Application Tracking
app.post('/company/applications/update', async (req, res) => {
    const { applicationId, status } = req.body;
    await Application.findByIdAndUpdate(applicationId, { status });
    res.json({ success: true, message: "Application status updated" });
});

// Start Server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
