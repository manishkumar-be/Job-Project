const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/job", { useNewUrlParser: true, useUnifiedTopology: true });

// Schema and Model
const profileSchema = new mongoose.Schema({
    name: String,
    gender: String,
    dob: Date,
    mobileNumbers: [String],
    emails: [String],
    education: [{ educationLevel: String, institution: String, percentage: String, passingYear: String }],
    skills: [String],
    projects: [String],
    certificate: String,
    resume: String,
});

const Profile = mongoose.model("Profile", profileSchema);

// File Upload
const storage = multer.diskStorage({
    destination: path.join(__dirname, "uploads"),
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// Routes
app.get("/profiles", async (req, res) => {
    const profile = await Profile.findOne();
    res.send(profile ? [profile] : []);
});

app.post("/saveProfile", upload.fields([
    { name: "certificate", maxCount: 1 },
    { name: "resume", maxCount: 1 },
]), async (req, res) => {
    const { name, gender, dob, mobileNumbers, emails, skills, projects } = req.body;
    const files = req.files;

    const profileData = {
        name, gender, dob, 
        mobileNumbers: Array.isArray(mobileNumbers) ? mobileNumbers : [mobileNumbers],
        emails: Array.isArray(emails) ? emails : [emails],
        skills: Array.isArray(skills) ? skills : [skills],
        projects: Array.isArray(projects) ? projects : [projects],
        certificate: files.certificate ? files.certificate[0].path : null,
        resume: files.resume ? files.resume[0].path : null,
    };

    let profile = await Profile.findOne();
    if (profile
