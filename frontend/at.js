document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('#application-table tbody');
    if (!tbody) return;

    fetch('http://localhost:8080/application-tracked')
        .then(response => response.json())
        .then(applications => {
            // Keep existing static rows if no data from server
            if (applications.length === 0) return;

            tbody.innerHTML = '';
            applications.forEach(app => {
                const row = document.createElement('tr');
                const status = app.status || 'Pending';
                row.innerHTML = `
                    <td>${app.jobPost || 'Unknown'}</td>
                    <td>${app.company || 'Unknown'}</td>
                    <td><span class="status" data-status="${status.toLowerCase()}">${status}</span></td>
                    <td>-</td>
                    <td>-</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching tracked applications:', error));
});
