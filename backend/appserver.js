const Application = mongoose.model('Application', new mongoose.Schema({
    applicantName: String,
    email: String,
    jobPost: String,
    status: { type: String, default: 'Pending' },
}));

// Fetch all applications
app.get('/applications', async (req, res) => {
    const applications = await Application.find();
    res.json(applications);
});

// Update application status
app.put('/applications/:id', async (req, res) => {
    const { status } = req.body;
    await Application.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: `Application status updated to ${status}!` });
});
