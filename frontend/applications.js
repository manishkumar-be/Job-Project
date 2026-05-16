document.addEventListener('DOMContentLoaded', () => {
    const applicationsTableBody = document.getElementById('applicationsTable').querySelector('tbody');

    // Fetch and display applications
    function loadApplications() {
        fetch('http://localhost:8080/applications')
            .then(response => response.json())
            .then(data => {
                applicationsTableBody.innerHTML = '';
                data.forEach(application => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${application.name}</td>
                        <td>${application.email}</td>
                        <td>${application.phone}</td>
                        <td class="actions">
                            <button class="accept" data-id="${application._id}">Accept</button>
                            <button class="reject" data-id="${application._id}">Reject</button>
                        </td>
                    `;
                    applicationsTableBody.appendChild(row);
                });
            });
    }

    // Handle Accept or Reject actions
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
                });
        }
    });

    // Initial load
    loadApplications();
});
