// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const cors = require("cors");

// const app = express();

// // Middleware
// app.use(cors()); // Enable cross-origin requests
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // MongoDB Connection
// const mongoURI = "mongodb://localhost:27017/job_portal"; // Update if using a different database name
// mongoose
//     .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log("MongoDB connected"))
//     .catch((err) => console.error("MongoDB connection error:", err));

// // Mongoose Schema and Model
// const companySchema = new mongoose.Schema({
//     companyName: { type: String, required: true },
//     aboutCompany: { type: String, required: true },
// });

// const Company = mongoose.model("Company", companySchema);

// // Routes

// // Get Company Profile
// app.get("/company/profile", async (req, res) => {
//     try {
//         const companyProfile = await Company.findOne();
//         if (companyProfile) {
//             res.status(200).json(companyProfile);
//         } else {
//             res.status(404).json({ message: "No company profile found." });
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Error retrieving company profile" });
//     }
// });

// // Save or Update Company Profile
// app.post("/company/profile", async (req, res) => {
//     try {
//         const { companyName, aboutCompany } = req.body;

//         // Update if exists, otherwise create a new profile
//         let companyProfile = await Company.findOne();
//         if (companyProfile) {
//             companyProfile.companyName = companyName;
//             companyProfile.aboutCompany = aboutCompany;
//         } else {
//             companyProfile = new Company({ companyName, aboutCompany });
//         }

//         await companyProfile.save();
//         res.status(200).json({ message: "Company profile saved successfully!" });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Error saving company profile" });
//     }
// });

// // Start the server
// const PORT = 8080;
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/company_profile', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB (company_profile database) successfully');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// Company Profile Schema and Model
const companyProfileSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    aboutCompany: { type: String, required: true },
});

const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema, 'company_profile');

// Routes

// Fetch Company Profile
app.get('/company/profile', async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne();
        if (profile) {
            res.json(profile);
        } else {
            res.status(404).json({ message: 'No company profile found.' });
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Save or Update Profile
app.post('/company/profile', async (req, res) => {
    try {
        const { companyName, aboutCompany } = req.body;

        let profile = await CompanyProfile.findOne();
        if (profile) {
            profile.companyName = companyName;
            profile.aboutCompany = aboutCompany;
        } else {
            profile = new CompanyProfile({ companyName, aboutCompany });
        }

        await profile.save();
        res.json({ message: 'Company profile saved successfully!' });
    } catch (error) {
        console.error('Error saving profile:', error);
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
