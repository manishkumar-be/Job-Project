document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#jobPostsTable tbody');

    fetch('http://localhost:8080/job-posts')
        .then(response => response.json())
        .then(jobPosts => {
            renderTable(jobPosts);
        })
        .catch(error => console.error('Error fetching job posts:', error));

    function renderTable(jobPosts) {
        tableBody.innerHTML = '';
        if (jobPosts.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">No job posts found.</td></tr>';
            return;
        }
        jobPosts.forEach(job => {
            const row = document.createElement('tr');
            row.dataset.id = job._id;
            row.innerHTML = `
                <td>${job.postName}</td>
                <td>${job.companyName}</td>
                <td>${job.location}</td>
                <td>$${job.salary}</td>
                <td>
                    <button class="edit-btn" data-id="${job._id}">Edit</button>
                    <button class="delete-btn" data-id="${job._id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const id = this.dataset.id;
                if (!confirm('Delete this job post?')) return;

                fetch(`http://localhost:8080/job-posts/${id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    window.location.reload();
                })
                .catch(error => console.error('Error deleting job post:', error));
            });
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function () {
                const id = this.dataset.id;
                const job = jobPosts.find(j => j._id === id);
                if (!job) return;

                const newPostName = prompt('Job Post Name:', job.postName);
                const newCompanyName = prompt('Company Name:', job.companyName);
                const newLocation = prompt('Location:', job.location);
                const newSalary = prompt('Salary:', job.salary);

                if (newPostName && newCompanyName && newLocation && newSalary) {
                    fetch(`http://localhost:8080/job-posts/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            postName: newPostName,
                            companyName: newCompanyName,
                            location: newLocation,
                            salary: parseInt(newSalary)
                        }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);
                        window.location.reload();
                    })
                    .catch(error => console.error('Error updating job post:', error));
                } else {
                    alert('All fields are required.');
                }
            });
        });
    }
});
