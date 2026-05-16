const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
const mongoURI = "mongodb://localhost:27017/job";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Mongoose Schema and Model
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

const Profile = mongoose.model("Profile", profileSchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Routes

// Save Profile
app.post("/saveProfile", upload.fields([
    { name: "certificate", maxCount: 1 },
    { name: "resume", maxCount: 1 },
]), async (req, res) => {
    try {
        const {
            name,
            gender,
            dob,
            mobileNumbers,
            emails,
            educationLevels,
            institution,
            percentage,
            passingYear,
            skills,
            projects,
        } = req.body;

        const education = educationLevels.map((level, index) => ({
            educationLevel: level,
            institution: institution[index],
            percentage: percentage[index],
            passingYear: passingYear[index],
        }));

        const profile = new Profile({
            name,
            gender,
            dob,
            mobileNumbers: Array.isArray(mobileNumbers) ? mobileNumbers : [mobileNumbers],
            emails: Array.isArray(emails) ? emails : [emails],
            education,
            skills: Array.isArray(skills) ? skills : [skills],
            projects: Array.isArray(projects) ? projects : [projects],
            certificate: req.files["certificate"] ? req.files["certificate"][0].path : null,
            resume: req.files["resume"] ? req.files["resume"][0].path : null,
        });

        await profile.save();
        res.status(200).send({ message: "Profile saved successfully!", profile });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Error saving profile" });
    }
});

// Get All Profiles
app.get("/profiles", async (req, res) => {
    try {
        const profiles = await Profile.find();
        res.status(200).send(profiles);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Error fetching profiles" });
    }
});

// Server setup
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
