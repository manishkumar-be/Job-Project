document.addEventListener('DOMContentLoaded', function () {
    const reviewTableBody = document.querySelector('#reviewTable tbody');

    // Fetch reviews from the companyreview file
    fetch('./companyreview.json') // Adjust the path to the actual location of the JSON file
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch company reviews: ${response.statusText}`);
            }
            return response.json();
        })
        .then(reviews => {
            reviewTableBody.innerHTML = ''; // Clear any existing data
            reviews.forEach(review => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${review.companyName}</td>
                    <td>${review.rating}</td>
                    <td>${review.reason}</td>
                `;
                reviewTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching reviews:', error));
});
