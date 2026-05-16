document.addEventListener('DOMContentLoaded', function () {
    const helpTableBody = document.querySelector('#helpTable tbody');

    // Fetch help requests from the server
    fetch('http://localhost:8080/help')
        .then(response => response.json())
        .then(helpRequests => {
            helpTableBody.innerHTML = '';
            helpRequests.forEach(request => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${request["User Email"]}</td>
                    <td>${request.Issue}</td>
                    <td>${new Date(request.date).toLocaleDateString()}</td>
                    <td>
                        <button class="resolve-btn" data-id="${request._id}">Resolve</button>
                        <button class="delete-btn" data-id="${request._id}">Delete</button>
                    </td>
                `;
                helpTableBody.appendChild(row);
            });

            // Add resolve functionality
            document.querySelectorAll('.resolve-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const id = this.dataset.id;

                    fetch(`http://localhost:8080/help/resolve/${id}`, {
                        method: 'PATCH'
                    })
                        .then(response => response.json())
                        .then(data => {
                            alert(data.message);
                            location.reload(); // Reload the page to see updated status
                        })
                        .catch(error => console.error('Error:', error));
                });
            });

            // Add delete functionality
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const id = this.dataset.id;

                    fetch(`http://localhost:8080/help/${id}`, {
                        method: 'DELETE'
                    })
                        .then(response => response.json())
                        .then(data => {
                            alert(data.message);
                            location.reload(); // Reload the page to see updated status
                        })
                        .catch(error => console.error('Error:', error));
                });
            });
        })
        .catch(error => console.error('Error fetching help requests:', error));
});
