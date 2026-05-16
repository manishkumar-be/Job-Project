const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Allow requests from the frontend
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

const path = require('path');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB connection
mongoose
    .connect('mongodb://localhost:27017/job', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Fetch all feedback
app.get('/feedback', async (req, res) => {
    try {
        const feedbackList = await Feedback.find().sort({ date: -1 }); // Fetch feedback sorted by newest first
        res.json(feedbackList);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching feedback', error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
