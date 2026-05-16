const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const path = require('path');

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/Job", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB connected");
}).catch(err => {
    console.error("Error connecting to MongoDB:", err);
});

// Define User Schema and Model
const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    companyName: { type: String } // Only applicable for companies
});

const User = mongoose.model('User', userSchema);

// Register endpoint
app.post('/register', async (req, res) => {
    console.log("under registration");
    const { email, password, registerType, companyName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save a new user
    const newUser = new User({
        email: email,
        password: hashedPassword,
        role: registerType,
        companyName: registerType === 'company' ? companyName : null
    });

    await newUser.save();
    res.json({ success: true, message: "Registration successful!" });
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

// Server setup
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
