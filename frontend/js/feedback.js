// Admin: read and delete feedback
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) return;

    const tableBody = document.querySelector('#feedbackTable tbody');

    async function loadFeedback() {
        try {
            const feedbackList = await api('/feedback');
            if (feedbackList.length === 0) {
                tableBody.innerHTML = '<tr class="empty-row"><td colspan="4">No feedback yet.</td></tr>';
                return;
            }
            // Older records imported from CSV use "User Email" / "Message" as field names
            tableBody.innerHTML = feedbackList.map(feedback => `
                <tr>
                    <td>${escapeHtml(feedback.userEmail ?? feedback['User Email'])}</td>
                    <td>${escapeHtml(feedback.message ?? feedback.Message)}</td>
                    <td>${formatDate(feedback.date) || '-'}</td>
                    <td><button class="delete-btn" data-id="${escapeHtml(feedback._id)}">Delete</button></td>
                </tr>`).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr class="empty-row"><td colspan="4">${escapeHtml(error.message)}</td></tr>`;
        }
    }

    tableBody.addEventListener('click', async (event) => {
        const button = event.target.closest('.delete-btn');
        if (!button || !confirm('Delete this feedback?')) return;
        try {
            await api(`/feedback/${button.dataset.id}`, { method: 'DELETE' });
            loadFeedback();
        } catch (error) {
            alert(error.message);
        }
    });

    loadFeedback();
});
