// Company application tracker: change the status of each application
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) return;

    const tableBody = document.querySelector('#trackerTable tbody');
    const STATUSES = ['Pending', 'Accepted', 'Rejected'];

    async function loadTrackedApplications() {
        try {
            const applications = await api('/applications/company');
            if (applications.length === 0) {
                tableBody.innerHTML = '<tr class="empty-row"><td colspan="6">No applications to track yet.</td></tr>';
                return;
            }
            tableBody.innerHTML = applications.map(app => {
                const status = app.status || 'Pending';
                return `
                <tr>
                    <td>${escapeHtml(app.name)}</td>
                    <td>${escapeHtml(app.email)}</td>
                    <td>${escapeHtml(app.jobTitle)}</td>
                    <td>${formatDate(app.createdAt) || '-'}</td>
                    <td><span class="status-badge ${escapeHtml(status.toLowerCase())}">${escapeHtml(status)}</span></td>
                    <td>
                        <select class="update-status" data-id="${escapeHtml(app._id)}">
                            ${STATUSES.map(s => `<option value="${s}" ${s === status ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                    </td>
                </tr>`;
            }).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr class="empty-row"><td colspan="6">${escapeHtml(error.message)}</td></tr>`;
        }
    }

    tableBody.addEventListener('change', async (event) => {
        const select = event.target.closest('.update-status');
        if (!select) return;
        select.disabled = true;
        try {
            await api(`/applications/${select.dataset.id}/status`, { method: 'PUT', body: { status: select.value } });
        } catch (error) {
            alert(error.message);
        }
        loadTrackedApplications();
    });

    loadTrackedApplications();
});
