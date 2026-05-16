document.addEventListener('DOMContentLoaded', () => {
    const applicationsTableBody = document.getElementById('applicationsTable').querySelector('tbody');

    function loadApplications() {
        fetch('http://localhost:8080/applications')
            .then(response => response.json())
            .then(data => {
                applicationsTableBody.innerHTML = '';
                if (data.length === 0) {
                    applicationsTableBody.innerHTML = '<tr><td colspan="5">No applications yet.</td></tr>';
                    return;
                }
                data.forEach(application => {
                    const row = document.createElement('tr');
                    const status = application.status || 'Pending';
                    row.innerHTML = `
                        <td>${application.name}</td>
                        <td>${application.email}</td>
                        <td>${application.phone}</td>
                        <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
                        <td class="actions">
                            <button class="accept" data-id="${application._id}" ${status !== 'Pending' ? 'disabled' : ''}>Accept</button>
                            <button class="reject" data-id="${application._id}" ${status !== 'Pending' ? 'disabled' : ''}>Reject</button>
                        </td>
                    `;
                    applicationsTableBody.appendChild(row);
                });
            })
            .catch(error => console.error('Error fetching applications:', error));
    }

    applicationsTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('accept') || event.target.classList.contains('reject')) {
            const id = event.target.dataset.id;
            const status = event.target.classList.contains('accept') ? 'Accepted' : 'Rejected';

            fetch(`http://localhost:8080/applications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                loadApplications();
            })
            .catch(error => console.error('Error updating application:', error));
        }
    });

    loadApplications();
});
