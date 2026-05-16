document.addEventListener('DOMContentLoaded', function () {
    const profileForm = document.getElementById('profileForm');
    const jobPostForm = document.getElementById('jobPostForm');
    
    const profileDetails = document.getElementById('profileDetails');
    const jobPosts = document.getElementById('jobPosts');
    const applicationList = document.getElementById('applicationList');
    const trackedApplications = document.getElementById('trackedApplications');

    // Save Profile
    profileForm.addEventListener('submit', function (event) {
        event.preventDefault();
        
        const companyName = document.getElementById('companyName').value;
        const companyDetails = document.getElementById('companyDetails').value;

        fetch('http://127.0.0.1:8080/saveProfile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyName, companyDetails })
        })
        .then(response => response.json())
        .then(data => {
            profileDetails.innerHTML = `<h3>${data.companyName}</h3><p>${data.companyDetails}</p>`;
        });
    });

    // Post Job
    jobPostForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const postName = document.getElementById('postName').value;
        const location = document.getElementById('location').value;
        const salary = document.getElementById('salary').value;
        const workType = document.getElementById('workType').value;
        const companyType = document.getElementById('companyType').value;

        fetch('http://127.0.0.1:8080/postJob', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postName, location, salary, workType, companyType })
        })
        .then(response => response.json())
        .then(data => {
            jobPosts.innerHTML += `<p>${data.postName} - ${data.location} - ${data.salary} - ${data.workType}</p>`;
        });
    });

    // Fetch Applications
    fetch('http://127.0.0.1:8080/getApplications')
        .then(response => response.json())
        .then(data => {
            applicationList.innerHTML = data.map(app => `<p>${app.jobSeekerName} - ${app.status}</p>`).join('');
        });

    // Fetch Tracked Applications
    fetch('http://127.0.0.1:8080/getTrackedApplications')
        .then(response => response.json())
        .then(data => {
            trackedApplications.innerHTML = data.map(app => `<p>${app.jobSeekerName} - ${app.nextRoundStatus}</p>`).join('');
        });
});
