document.addEventListener('DOMContentLoaded', function () {
    const reviewTableBody = document.querySelector('#reviewTable tbody');
    const reviewForm = document.getElementById('reviewForm');

    function loadReviews() {
        fetch('http://localhost:8080/companyreviews')
            .then(response => response.json())
            .then(reviews => {
                reviewTableBody.innerHTML = '';
                if (reviews.length === 0) {
                    reviewTableBody.innerHTML = '<tr><td colspan="3">No reviews yet.</td></tr>';
                    return;
                }
                reviews.forEach(review => {
                    const row = document.createElement('tr');
                    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                    row.innerHTML = `
                        <td>${review.companyName}</td>
                        <td title="${review.rating}/5">${stars}</td>
                        <td>${review.reason || '-'}</td>
                    `;
                    reviewTableBody.appendChild(row);
                });
            })
            .catch(error => {
                reviewTableBody.innerHTML = '<tr><td colspan="3">Error loading reviews.</td></tr>';
                console.error('Error fetching reviews:', error);
            });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const companyName = document.getElementById('reviewCompany').value;
            const rating = parseInt(document.getElementById('reviewRating').value);
            const reason = document.getElementById('reviewReason').value;

            fetch('http://localhost:8080/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyName, rating, reason }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    reviewForm.reset();
                    loadReviews();
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error('Error submitting review:', error));
        });
    }

    loadReviews();
});
