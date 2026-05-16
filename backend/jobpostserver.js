// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect('mongodb://localhost:27017/job', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => {
//     console.log('Connected to MongoDB (job database) successfully');
// }).catch((err) => {
//     console.error('Error connecting to MongoDB:', err);
// });

// // Job Post Schema and Model (collection name explicitly set to "jobpost")
// const JobPost = mongoose.model(
//     'JobPost',
//     new mongoose.Schema({
//         postName: String,
//         companyName: String,
//         location: String,
//         salary: Number,
//         companyType: String,
//         workType: String,
//     }),
//     'jobpost' // Explicitly define the collection name
// );

// // Routes for Job Posts

// // Fetch all job posts
// app.get('/job-posts', async (req, res) => {
//     try {
//         const jobPosts = await JobPost.find();
//         res.json(jobPosts);
//     } catch (error) {
//         console.error('Error fetching job posts:', error);
//         res.status(500).json({ error: 'Failed to fetch job posts' });
//     }
// });

// // Add a new job post
// app.post('/job-posts', async (req, res) => {
//     try {
//         const job = new JobPost(req.body);
//         await job.save();
//         res.json({ message: 'Job post created successfully!' });
//     } catch (error) {
//         console.error('Error creating job post:', error);
//         res.status(500).json({ error: 'Failed to create job post' });
//     }
// });

// // Delete a job post
// app.delete('/job-posts/:id', async (req, res) => {
//     try {
//         await JobPost.findByIdAndDelete(req.params.id);
//         res.json({ message: 'Job post deleted successfully!' });
//     } catch (error) {
//         console.error('Error deleting job post:', error);
//         res.status(500).json({ error: 'Failed to delete job post' });
//     }
// });

// // Edit/Update a job post
// app.put('/job-posts/:id', async (req, res) => {
//     try {
//         const updatedJob = await JobPost.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true }
//         );
//         res.json({ message: 'Job post updated successfully!', updatedJob });
//     } catch (error) {
//         console.error('Error updating job post:', error);
//         res.status(500).json({ error: 'Failed to update job post' });
//     }
// });

// // Default Route
// app.get('/', (req, res) => {
//     res.send('Job Portal API is running!');
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
mongoose.connect('mongodb://127.0.0.1:27017/Job', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB (Job database) successfully');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Job Post Schema and Model
const JobPost = mongoose.model(
    'JobPost',
    new mongoose.Schema({
        postName: { type: String, required: true },
        companyName: { type: String, required: true },
        location: { type: String, required: true },
        salary: { type: Number, required: true },
        companyType: { type: String, required: true },
        workType: { type: String, required: true },
    }),
    'jobpost' // Collection name explicitly set
);

// Routes for Job Posts

// Fetch all job posts
app.get('/job-posts', async (req, res) => {
    try {
        const jobPosts = await JobPost.find();
        res.json(jobPosts);
    } catch (error) {
        console.error('Error fetching job posts:', error);
        res.status(500).json({ error: 'Failed to fetch job posts' });
    }
});

// Add a new job post
app.post('/job-posts', async (req, res) => {
    try {
        const job = new JobPost(req.body);
        await job.save();
        res.json({ message: 'Job post created successfully!' });
    } catch (error) {
        console.error('Error creating job post:', error);
        res.status(500).json({ error: 'Failed to create job post' });
    }
});

// Delete a job post
app.delete('/job-posts/:id', async (req, res) => {
    try {
        await JobPost.findByIdAndDelete(req.params.id);
        res.json({ message: 'Job post deleted successfully!' });
    } catch (error) {
        console.error('Error deleting job post:', error);
        res.status(500).json({ error: 'Failed to delete job post' });
    }
});

// Edit/Update a job post
app.put('/job-posts/:id', async (req, res) => {
    try {
        const updatedJob = await JobPost.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ message: 'Job post updated successfully!', updatedJob });
    } catch (error) {
        console.error('Error updating job post:', error);
        res.status(500).json({ error: 'Failed to update job post' });
    }
});

// Default Route
app.get('/', (req, res) => {
    res.send('Job Portal API is running!');
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
