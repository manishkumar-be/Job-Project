document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#jobPostsTable tbody');

    // Fetch job posts from the server
    fetch('http://localhost:8080/job-posts')
        .then(response => response.json())
        .then(jobPosts => {
            tableBody.innerHTML = ''; // Clear the table body
            jobPosts.forEach(job => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${job.postName}</td>
                    <td>${job.companyName}</td>
                    <td>${job.location}</td>
                    <td>${job.salary}</td>
                    <td>
                        <button class="edit-btn" data-id="${job._id}">Edit</button>
                        <button class="delete-btn" data-id="${job._id}">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Add delete functionality
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const id = this.dataset.id;

                    fetch(`http://localhost:8080/job-posts/${id}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    })
                        .then(response => response.json())
                        .then(data => {
                            alert(data.message); // Display success message
                            location.reload(); // Reload to update the job post list
                        })
                        .catch(error => console.error('Error deleting job post:', error));
                });
            });

            // Add edit functionality
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const id = this.dataset.id;
                    const job = jobPosts.find(job => job._id === id);

                    const postName = prompt('Enter new job post name:', job.postName);
                    const companyName = prompt('Enter new company name:', job.companyName);
                    const location = prompt('Enter new location:', job.location);
                    const salary = prompt('Enter new salary:', job.salary);

                    if (postName && companyName && location && salary) {
                        fetch(`http://localhost:8080/job-posts/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ postName, companyName, location, salary }),
                        })
                            .then(response => response.json())
                            .then(data => {
                                alert(data.message); // Display success message
                                location.reload(); // Reload to update the job post list
                            })
                            .catch(error => console.error('Error updating job post:', error));
                    } else {
                        alert('All fields are required to update the job post.');
                    }
                });
            });
        })
        .catch(error => console.error('Error fetching job posts:', error));
});
