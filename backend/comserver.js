const JobPost = mongoose.model('JobPost', new mongoose.Schema({
    postName: String,
    companyName: String,
    location: String,
    salary: Number,
    companyType: String,
    workType: String,
}));

// Fetch all job posts
app.get('/job-posts', async (req, res) => {
    const jobPosts = await JobPost.find();
    res.json(jobPosts);
});

// Add a new job post
app.post('/job-posts', async (req, res) => {
    const job = new JobPost(req.body);
    await job.save();
    res.json({ message: 'Job post created successfully!' });
});

// Delete a job post
app.delete('/job-posts/:id', async (req, res) => {
    await JobPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job post deleted successfully!' });
});
