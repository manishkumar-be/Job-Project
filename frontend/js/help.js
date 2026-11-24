// Admin: resolve and delete help requests
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) return;

    const tableBody = document.querySelector('#helpTable tbody');

    async function loadHelpRequests() {
        try {
            const requests = await api('/help');
            if (requests.length === 0) {
                tableBody.innerHTML = '<tr class="empty-row"><td colspan="5">No help requests.</td></tr>';
                return;
            }
            // Older records imported from CSV use "User Email" / "Issue" as field names
            tableBody.innerHTML = requests.map(request => `
                <tr>
                    <td>${escapeHtml(request.userEmail ?? request['User Email'])}</td>
                    <td>${escapeHtml(request.issue ?? request.Issue)}</td>
                    <td>${formatDate(request.date) || '-'}</td>
                    <td>${request.resolved ? 'Resolved' : 'Open'}</td>
                    <td>
                        <button class="resolve-btn" data-id="${escapeHtml(request._id)}" ${request.resolved ? 'disabled' : ''}>Resolve</button>
                        <button class="delete-btn" data-id="${escapeHtml(request._id)}">Delete</button>
                    </td>
                </tr>`).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr class="empty-row"><td colspan="5">${escapeHtml(error.message)}</td></tr>`;
        }
    }

    tableBody.addEventListener('click', async (event) => {
        const button = event.target.closest('button');
        if (!button || button.disabled) return;
        const id = button.dataset.id;
        try {
            if (button.classList.contains('resolve-btn')) {
                await api(`/help/${id}/resolve`, { method: 'PATCH' });
            } else if (button.classList.contains('delete-btn')) {
                if (!confirm('Delete this help request?')) return;
                await api(`/help/${id}`, { method: 'DELETE' });
            }
            loadHelpRequests();
        } catch (error) {
            alert(error.message);
        }
    });

    loadHelpRequests();
});
