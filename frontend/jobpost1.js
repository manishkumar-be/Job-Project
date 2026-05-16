document.addEventListener('DOMContentLoaded', () => {
    const jobPostForm = document.getElementById('jobPostForm');
    const jobPostsTableBody = document.getElementById('jobPostsTable').querySelector('tbody');

    function loadJobPosts() {
        fetch('http://localhost:8080/job-posts')
            .then(response => response.json())
            .then(data => {
                jobPostsTableBody.innerHTML = '';
                data.forEach(job => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${job.postName}</td>
                        <td>${job.companyName}</td>
                        <td>${job.location}</td>
                        <td>$${job.salary}</td>
                        <td>${job.companyType || '-'}</td>
                        <td>${job.workType || '-'}</td>
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

    jobPostsTableBody.addEventListener('click', (event) => {
        const id = event.target.dataset.id;

        if (event.target.classList.contains('delete')) {
            if (!confirm('Delete this job post?')) return;
            fetch(`http://localhost:8080/job-posts/${id}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    loadJobPosts();
                })
                .catch(error => console.error('Error deleting job post:', error));

        } else if (event.target.classList.contains('edit')) {
            const row = event.target.closest('tr');
            const cells = row.querySelectorAll('td');
            const postName = prompt('Post Name:', cells[0].textContent);
            const companyName = prompt('Company Name:', cells[1].textContent);
            const location = prompt('Location:', cells[2].textContent);
            const salary = prompt('Salary:', cells[3].textContent.replace('$', ''));
            const companyType = prompt('Company Type:', cells[4].textContent);
            const workType = prompt('Work Type (Online/offline/hybrid):', cells[5].textContent);

            if (postName && companyName && location && salary) {
                fetch(`http://localhost:8080/job-posts/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postName, companyName, location, salary: parseInt(salary), companyType, workType }),
                })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    loadJobPosts();
                })
                .catch(error => console.error('Error updating job post:', error));
            }
        }
    });

    loadJobPosts();
});
