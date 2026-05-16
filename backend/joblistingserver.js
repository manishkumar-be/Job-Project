const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));
const upload = multer({ dest: path.join(__dirname, "uploads") });

mongoose.connect("mongodb://localhost:27017/job", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const applicationSchema = new mongoose.Schema({
    jobId: Number,
    name: String,
    phone: String,
    email: String,
    resume: String,
});

const Application = mongoose.model("Application", applicationSchema);

app.post("/submitApplication", upload.single("resume"), async (req, res) => {
    const applicationData = JSON.parse(req.body.application);
    const application = new Application({
        ...applicationData,
        resume: req.file.path,
    });

    await application.save();
    res.send({ message: "Application submitted successfully" });
});

app.listen(8080, () => console.log("Server running on port 8080"));
