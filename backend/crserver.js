// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect('mongodb://localhost:27017/job_portal', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => {
//     console.log('Connected to MongoDB successfully');
// }).catch((err) => {
//     console.error('Error connecting to MongoDB:', err);
// });

// // Company Review Schema
// const CompanyReview = mongoose.model('CompanyReview', new mongoose.Schema({
//     companyName: String,
//     reviewText: String,
//     ratings: {
//         workCulture: Number,
//         environment: Number,
//         salary: Number,
//         location: Number,
//         colleagueBehavior: Number,
//         overallExperience: Number,
//     },
//     timestamp: { type: Date, default: Date.now }
// }));

// // Fetch reviews for a specific company
// app.get('/reviews/:company', async (req, res) => {
//     const { company } = req.params;
//     const { page = 1, limit = 5 } = req.query;

//     try {
//         const reviews = await CompanyReview.find({ companyName: company })
//             .sort({ timestamp: -1 })
//             .skip((page - 1) * limit)
//             .limit(Number(limit));

//         const totalReviews = await CompanyReview.countDocuments({ companyName: company });
//         res.json({ reviews, totalReviews });
//     } catch (error) {
//         console.error('Error fetching reviews:', error);
//         res.status(500).json({ error: 'Failed to fetch reviews' });
//     }
// });

// // Default Route
// app.get('/', (req, res) => {
//     res.send('Company Review API is running!');
// });

// // Start the server
// const PORT = 8080;
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
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
mongoose.connect('mongodb://localhost:27017/job_portal', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB successfully');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Simplified Company Review Schema
const CompanyReview = mongoose.model('CompanyReview', new mongoose.Schema({
    companyName: String,    // Company Name
    rating: Number,         // Rating (1 to 10)
    reason: String,         // Reason for the review
    timestamp: { type: Date, default: Date.now } // Automatically managed timestamp
}));

// Fetch reviews for a specific company with pagination
app.get('/reviews/:company', async (req, res) => {
    const { company } = req.params;
    const { page = 1, limit = 5 } = req.query;

    try {
        // Fetch paginated reviews
        const reviews = await CompanyReview.find({ companyName: company })
            .sort({ timestamp: -1 }) // Sort reviews by most recent
            .skip((page - 1) * limit)
            .limit(Number(limit));

        // Count total reviews for the company
        const totalReviews = await CompanyReview.countDocuments({ companyName: company });

        // Return the data as JSON
        res.json({ reviews, totalReviews });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Default Route
app.get('/', (req, res) => {
    res.send('Company Review API is running!');
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
