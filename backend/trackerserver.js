const ApplicationTracked = mongoose.model('ApplicationTracked', new mongoose.Schema({
    applicantName: String,
    email: String,
    jobPost: String,
    status: { type: String, default: 'Pending' },
}));

// Fetch all tracked applications
app.get('/application-tracked', async (req, res) => {
    const trackedApplications = await ApplicationTracked.find();
    res.json(trackedApplications);
});

// Update tracked application status
app.put('/application-tracked/:id', async (req, res) => {
    const { status } = req.body;
    await ApplicationTracked.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: `Application status updated to ${status}!` });
});
