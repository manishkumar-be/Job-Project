document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#usersTable tbody');

    // Fetch users from the server
    fetch('http://localhost:8080/users')
        .then(response => response.json())
        .then(users => {
            tableBody.innerHTML = ''; // Clear the table body
            users.forEach(user => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>${user.companyName || 'N/A'}</td>
                    <td>
                        <button class="edit-btn" data-id="${user._id}">Edit</button>
                        <button class="delete-btn" data-id="${user._id}">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Add delete functionality
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const id = this.dataset.id;

                    fetch(`http://localhost:8080/users/${id}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    })
                        .then(response => response.json())
                        .then(data => {
                            alert(data.message); // Display success message
                            location.reload(); // Reload to update the user list
                        })
                        .catch(error => console.error('Error deleting user:', error));
                });
            });

            // Add edit functionality
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const id = this.dataset.id;
                    const email = prompt('Enter new email:');
                    const role = prompt('Enter new role (user/company):');
                    const companyName = role === 'company' ? prompt('Enter new company name:') : null;

                    if (email && role) {
                        fetch(`http://localhost:8080/users/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, role, companyName }),
                        })
                            .then(response => response.json())
                            .then(data => {
                                alert(data.message); // Display success message
                                location.reload(); // Reload to update the user list
                            })
                            .catch(error => console.error('Error updating user:', error));
                    }
                });
            });
        })
        .catch(error => console.error('Error fetching users:', error));
});
