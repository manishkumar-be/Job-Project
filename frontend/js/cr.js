// Company reviews: read reviews and write a new one
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) return;

    const tableBody = document.querySelector('#reviewTable tbody');
    const reviewForm = document.getElementById('reviewForm');
    const reviewMessage = document.getElementById('reviewMessage');
    const searchInput = document.getElementById('companySearch');

    async function loadReviews() {
        const company = searchInput.value.trim();
        tableBody.innerHTML = '<tr class="empty-row"><td colspan="4">Loading...</td></tr>';
        try {
            const reviews = await api(`/reviews${company ? `?company=${encodeURIComponent(company)}` : ''}`);
            if (reviews.length === 0) {
                tableBody.innerHTML = `<tr class="empty-row"><td colspan="4">${company ? 'No reviews for this company yet.' : 'No reviews yet. Be the first to write one!'}</td></tr>`;
                return;
            }
            tableBody.innerHTML = reviews.map(review => `
                <tr>
                    <td>${escapeHtml(review.companyName)}</td>
                    <td>${escapeHtml(review.rating)} / 10</td>
                    <td>${escapeHtml(review.reason)}</td>
                    <td>${formatDate(review.timestamp)}</td>
                </tr>`).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr class="empty-row"><td colspan="4">${escapeHtml(error.message)}</td></tr>`;
        }
    }

    document.getElementById('company-search').addEventListener('submit', (event) => {
        event.preventDefault();
        loadReviews();
    });

    reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = reviewForm.querySelector('button[type="submit"]');
        button.disabled = true;
        try {
            const data = await api('/reviews', {
                method: 'POST',
                body: {
                    companyName: document.getElementById('reviewCompany').value.trim(),
                    rating: Number(document.getElementById('reviewRating').value),
                    reason: document.getElementById('reviewReason').value.trim(),
                },
            });
            showMessage(reviewMessage, data.message, 'success');
            reviewForm.reset();
            loadReviews();
        } catch (error) {
            showMessage(reviewMessage, error.message, 'error');
        } finally {
            button.disabled = false;
        }
    });

    loadReviews();
});
