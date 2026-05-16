const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const csvtojson = require('csvtojson');

const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/job_portal', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({ email: String, password: String, companyName: String });
const User = mongoose.model('User', userSchema);

// Load CSV data to MongoDB if needed
async function loadCSVtoDB() {
    const jobSeekers = await csvtojson().fromFile('job_seekers.csv');
    const companies = await csvtojson().fromFile('companies.csv');
    const admins = await csvtojson().fromFile('admins.csv');

    // Populate MongoDB with job seeker and company records if collections are empty
    await User.insertMany(jobSeekers.map(seeker => ({ ...seeker, userType: 'jobSeeker' })));
    await User.insertMany(companies.map(company => ({ ...company, userType: 'company' })));
    await User.insertMany(admins.map(admin => ({ ...admin, userType: 'admin' })));
}

// Login endpoint
app.post('/login', async (req, res) => {
    const { userType, email, password } = req.body;

    const user = await User.findOne({ email, password, userType });
    if (user) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Registration endpoint
app.post('/register', async (req, res) => {
    const { registerType, email, password, companyName } = req.body;
    const userType = registerType === 'jobSeeker' ? 'jobSeeker' : 'company';

    const newUser = new User({ email, password, companyName, userType });
    await newUser.save();
    res.json({ success: true });
});

app.listen(8080, () => {
    console.log('Server running on port 8080');
});
