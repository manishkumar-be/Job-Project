document.addEventListener("DOMContentLoaded", function () {
    // Fetch job posts from the server
    fetch("http://localhost:8080/job-posts")
        .then((response) => response.json())
        .then((jobs) => {
            displayJobs(jobs); // Display fetched jobs
        })
        .catch((error) => console.error("Error fetching job posts:", error));

    // Fetch applications and display under the Apply section
    fetch("http://localhost:8080/applications")
        .then((response) => response.json())
        .then((applications) => {
            displayApplications(applications); // Display fetched applications
        })
        .catch((error) => console.error("Error fetching applications:", error));
});

function displayJobs(jobsToDisplay) {
    const jobList = document.getElementById("job-list");
    jobList.innerHTML = "";

    jobsToDisplay.forEach((job) => {
        const jobPost = document.createElement("div");
        jobPost.classList.add("job-post");

        jobPost.innerHTML = `
            <h3>${job.postName}</h3>
            <p><span>Post Name:</span> ${job.postName}</p>
            <p><span>Company:</span> ${job.companyName}</p>
            <p><span>Location:</span> ${job.location}</p>
            <p><span>Salary:</span> $${job.salary}</p>
            <p><span>Company Type:</span> ${job.companyType}</p>
            <p><span>work Type:</span> ${job.workType}</p>
            <button onclick="openModal('${job._id}')">Apply</button>
        `;

        jobList.appendChild(jobPost);
    });
}

function openModal(jobId) {
    document.getElementById("job-id").value = jobId;
    document.getElementById("apply-modal").style.display = "block";
}

function closeModal() {
    document.getElementById("apply-modal").style.display = "none";
}

async function submitApplication() {
    const application = {
        jobId: document.getElementById("job-id").value,
        name: document.getElementById("applicant-name").value,
        phone: document.getElementById("applicant-phone").value,
        email: document.getElementById("applicant-email").value,
    };

    const resumeFile = document.getElementById("applicant-resume").files[0];
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("application", JSON.stringify(application));

    try {
        const response = await fetch("http://localhost:8080/submitApplication", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            alert("Application submitted successfully!");
            closeModal();
            location.reload(); // Reload to fetch updated applications
        } else {
            const error = await response.json();
            alert(`Error submitting application: ${error.message}`);
        }
    } catch (error) {
        console.error("Error submitting application:", error);
    }
}

function displayApplications(applications) {
    const applicationList = document.getElementById("application-list");
    applicationList.innerHTML = "";

    applications.forEach((application) => {
        const applicationItem = document.createElement("div");
        applicationItem.classList.add("application-item");

        applicationItem.innerHTML = `
            <h4>${application.name}</h4>
            <p><span>Job ID:</span> ${application.jobId}</p>
            <p><span>Email:</span> ${application.email}</p>
            <p><span>Phone:</span> ${application.phone}</p>
            <a href="${application.resume}" target="_blank">View Resume</a>
        `;

        applicationList.appendChild(applicationItem);
    });
}
