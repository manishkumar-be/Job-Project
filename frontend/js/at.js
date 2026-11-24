// Job seeker's application tracker
document.addEventListener('DOMContentLoaded', async () => {
    if (!currentUser) return;

    const tableBody = document.querySelector('#application-table tbody');
    try {
        const applications = await api('/applications/mine');
        if (applications.length === 0) {
            tableBody.innerHTML = '<tr class="empty-row"><td colspan="5">You have not applied for any jobs yet. <a href="joblisting.html">Browse jobs</a></td></tr>';
            return;
        }
        tableBody.innerHTML = applications.map(app => `
            <tr>
                <td>${escapeHtml(app.jobTitle)}</td>
                <td>${escapeHtml(app.companyName || '-')}</td>
                <td>${formatDate(app.createdAt) || '-'}</td>
                <td>${app.resume ? `<a href="${escapeHtml(fileLink(app.resume))}" target="_blank" rel="noopener">View</a>` : '-'}</td>
                <td><span class="status-badge ${escapeHtml((app.status || 'Pending').toLowerCase())}">${escapeHtml(app.status || 'Pending')}</span></td>
            </tr>`).join('');
    } catch (error) {
        tableBody.innerHTML = `<tr class="empty-row"><td colspan="5">${escapeHtml(error.message)}</td></tr>`;
    }
});
