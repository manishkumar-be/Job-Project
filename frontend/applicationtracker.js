document.addEventListener('DOMContentLoaded', () => {
    const trackerTableBody = document.getElementById('trackerTable').querySelector('tbody');

    // Fetch and display tracked applications
    function loadTrackedApplications() {
        fetch('http://localhost:8080/application-tracked')
            .then(response => response.json())
            .then(data => {
                trackerTableBody.innerHTML = '';
                data.forEach(application => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${application.applicantName}</td>
                        <td>${application.email}</td>
                        <td>${application.jobPost}</td>
                        <td class="status ${application.status.toLowerCase()}">${application.status}</td>
                        <td>
                            <select class="update-status" data-id="${application._id}">
                                <option value="">Update Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </td>
                    `;
                    trackerTableBody.appendChild(row);
                });
            });
    }

    // Update application status
    trackerTableBody.addEventListener('change', (event) => {
        if (event.target.classList.contains('update-status')) {
            const id = event.target.dataset.id;
            const status = event.target.value;

            fetch(`http://localhost:8080/application-tracked/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    loadTrackedApplications();
                });
        }
    });

    // Initial load
    loadTrackedApplications();
});
