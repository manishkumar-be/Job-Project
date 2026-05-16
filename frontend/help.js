document.addEventListener('DOMContentLoaded', function () {
    const helpTableBody = document.querySelector('#helpTable tbody');

    function loadHelpRequests() {
        fetch('http://localhost:8080/help')
            .then(response => response.json())
            .then(helpRequests => {
                helpTableBody.innerHTML = '';
                if (helpRequests.length === 0) {
                    helpTableBody.innerHTML = '<tr><td colspan="4">No help requests.</td></tr>';
                    return;
                }
                helpRequests.forEach(request => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${request.userEmail || '-'}</td>
                        <td>${request.issue || '-'}</td>
                        <td>${new Date(request.date).toLocaleDateString()}</td>
                        <td>
                            <button class="resolve-btn" data-id="${request._id}" ${request.resolved ? 'disabled' : ''}>
                                ${request.resolved ? 'Resolved' : 'Resolve'}
                            </button>
                            <button class="delete-btn" data-id="${request._id}">Delete</button>
                        </td>
                    `;
                    helpTableBody.appendChild(row);
                });

                document.querySelectorAll('.resolve-btn').forEach(button => {
                    button.addEventListener('click', function () {
                        const id = this.dataset.id;
                        fetch(`http://localhost:8080/help/resolve/${id}`, { method: 'PATCH' })
                            .then(response => response.json())
                            .then(data => {
                                alert(data.message);
                                loadHelpRequests();
                            })
                            .catch(error => console.error('Error resolving:', error));
                    });
                });

                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', function () {
                        const id = this.dataset.id;
                        if (!confirm('Delete this help request?')) return;
                        fetch(`http://localhost:8080/help/${id}`, { method: 'DELETE' })
                            .then(response => response.json())
                            .then(data => {
                                alert(data.message);
                                loadHelpRequests();
                            })
                            .catch(error => console.error('Error deleting:', error));
                    });
                });
            })
            .catch(error => console.error('Error fetching help requests:', error));
    }

    loadHelpRequests();
});
