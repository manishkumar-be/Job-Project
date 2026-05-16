document.addEventListener("DOMContentLoaded", function () {
    fetch("http://localhost:8080/job-posts")
        .then((response) => response.json())
        .then((jobs) => {
            displayJobs(jobs);
        })
        .catch((error) => console.error("Error fetching job posts:", error));
});

let allJobs = [];

function displayJobs(jobsToDisplay) {
    allJobs = jobsToDisplay;
    const jobList = document.getElementById("job-list");
    jobList.innerHTML = "";

    if (jobsToDisplay.length === 0) {
        jobList.innerHTML = '<p>No jobs found matching your criteria.</p>';
        return;
    }

    jobsToDisplay.forEach((job) => {
        const jobPost = document.createElement("div");
        jobPost.classList.add("job-post");
        jobPost.innerHTML = `
            <h3>${job.postName}</h3>
            <p><span>Company:</span> ${job.companyName}</p>
            <p><span>Location:</span> ${job.location}</p>
            <p><span>Salary:</span> $${job.salary?.toLocaleString()}</p>
            <p><span>Company Type:</span> ${job.companyType || '-'}</p>
            <p><span>Work Type:</span> ${job.workType || '-'}</p>
            <button onclick="openModal('${job._id}')">Apply</button>
        `;
        jobList.appendChild(jobPost);
    });
}

function filterJobs() {
    const company = document.getElementById("company-name").value.toLowerCase();
    const location = document.getElementById("location").value.toLowerCase();
    const minSalary = parseFloat(document.getElementById("min-salary").value) || 0;
    const maxSalary = parseFloat(document.getElementById("max-salary").value) || Infinity;
    const companyType = document.getElementById("company-type").value.toLowerCase();
    const workType = document.getElementById("work-type").value.toLowerCase();

    fetch("http://localhost:8080/job-posts")
        .then(response => response.json())
        .then(jobs => {
            const filtered = jobs.filter(job => {
                return (
                    (!company || job.companyName.toLowerCase().includes(company)) &&
                    (!location || job.location.toLowerCase().includes(location)) &&
                    (job.salary >= minSalary) &&
                    (job.salary <= maxSalary) &&
                    (!companyType || (job.companyType || '').toLowerCase().includes(companyType)) &&
                    (!workType || (job.workType || '').toLowerCase().includes(workType))
                );
            });
            displayJobs(filtered);
        })
        .catch(error => console.error("Error filtering jobs:", error));
}

function openModal(jobId) {
    document.getElementById("job-id").value = jobId;
    document.getElementById("apply-modal").style.display = "block";
}

function closeModal() {
    document.getElementById("apply-modal").style.display = "none";
    document.getElementById("application-form").reset();
}

async function submitApplication() {
    const application = {
        jobId: document.getElementById("job-id").value,
        name: document.getElementById("applicant-name").value,
        phone: document.getElementById("applicant-phone").value,
        email: document.getElementById("applicant-email").value,
    };

    const resumeFile = document.getElementById("applicant-resume").files[0];
    if (!resumeFile) {
        alert('Please upload your resume.');
        return;
    }

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
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (error) {
        console.error("Error submitting application:", error);
        alert("Failed to submit application. Please try again.");
    }
}
