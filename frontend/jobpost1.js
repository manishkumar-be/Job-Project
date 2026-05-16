document.addEventListener('DOMContentLoaded', () => {
    const jobPostForm = document.getElementById('jobPostForm');
    const jobPostsTableBody = document.getElementById('jobPostsTable').querySelector('tbody');

    // Fetch and display job posts
    function loadJobPosts() {
        fetch('http://localhost:27017/job')
            .then(response => response.json())
            .then(data => {
                jobPostsTableBody.innerHTML = '';
                data.forEach(job => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${job.postName}</td>
                        <td>${job.companyName}</td>
                        <td>${job.location}</td>
                        <td>${job.salary}</td>
                        <td>${job.companyType}</td>
                        <td>${job.workType}</td>
                        <td class="actions">
                            <button class="edit" data-id="${job._id}">Edit</button>
                            <button class="delete" data-id="${job._id}">Delete</button>
                        </td>
                    `;
                    jobPostsTableBody.appendChild(row);
                });
            })
            .catch(error => console.error('Error fetching job posts:', error));
    }

    // Add a new job post
    jobPostForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const jobPostData = {
            postName: jobPostForm.postName.value,
            companyName: jobPostForm.companyName.value,
            location: jobPostForm.location.value,
            salary: parseInt(jobPostForm.salary.value),
            companyType: jobPostForm.companyType.value,
            workType: jobPostForm.workType.value,
        };

        fetch('http://localhost:8080/job-posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobPostData),
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                loadJobPosts();
                jobPostForm.reset();
            })
            .catch(error => console.error('Error adding job post:', error));
    });

    // Edit or delete a job post
    jobPostsTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete')) {
            const id = event.target.dataset.id;
            fetch(`http://localhost:8080/job-posts/${id}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    loadJobPosts();
                })
                .catch(error => console.error('Error deleting job post:', error));
        } else if (event.target.classList.contains('edit')) {
            const id = event.target.dataset.id;
            // Fetch job post details for editing (Implementation depends on UI flow)
        }
    });

    // Initial load
    loadJobPosts();
});
