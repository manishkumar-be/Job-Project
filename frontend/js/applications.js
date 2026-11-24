// Applications to the company's jobs: view and accept / reject
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) return;

    const tableBody = document.querySelector('#applicationsTable tbody');

    async function loadApplications() {
        try {
            const applications = await api('/applications/company');
            if (applications.length === 0) {
                tableBody.innerHTML = '<tr class="empty-row"><td colspan="7">No applications yet.</td></tr>';
                return;
            }
            tableBody.innerHTML = applications.map(app => {
                const status = app.status || 'Pending';
                return `
                <tr>
                    <td>${escapeHtml(app.name)}</td>
                    <td>${escapeHtml(app.email)}</td>
                    <td>${escapeHtml(app.phone)}</td>
                    <td>${escapeHtml(app.jobTitle)}</td>
                    <td>${app.resume ? `<a href="${escapeHtml(fileLink(app.resume))}" target="_blank" rel="noopener">View</a>` : '-'}</td>
                    <td><span class="status-badge ${escapeHtml(status.toLowerCase())}">${escapeHtml(status)}</span></td>
                    <td class="actions">
                        <button class="accept" data-id="${escapeHtml(app._id)}" ${status === 'Accepted' ? 'disabled' : ''}>Accept</button>
                        <button class="reject" data-id="${escapeHtml(app._id)}" ${status === 'Rejected' ? 'disabled' : ''}>Reject</button>
                    </td>
                </tr>`;
            }).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr class="empty-row"><td colspan="7">${escapeHtml(error.message)}</td></tr>`;
        }
    }

    tableBody.addEventListener('click', async (event) => {
        const button = event.target.closest('button.accept, button.reject');
        if (!button) return;
        const status = button.classList.contains('accept') ? 'Accepted' : 'Rejected';
        button.disabled = true;
        try {
            await api(`/applications/${button.dataset.id}/status`, { method: 'PUT', body: { status } });
            loadApplications();
        } catch (error) {
            alert(error.message);
            button.disabled = false;
        }
    });

    loadApplications();
});
