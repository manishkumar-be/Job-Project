document.addEventListener('DOMContentLoaded', function () {
    const feedbackTableBody = document.querySelector('#feedbackTable tbody');

    fetch('http://localhost:8080/feedback')
        .then(response => response.json())
        .then(feedbackList => {
            feedbackTableBody.innerHTML = '';
            if (feedbackList.length === 0) {
                feedbackTableBody.innerHTML = '<tr><td colspan="3">No feedback yet.</td></tr>';
                return;
            }
            feedbackList.forEach(feedback => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${feedback.userEmail || '-'}</td>
                    <td>${feedback.message || '-'}</td>
                    <td>${new Date(feedback.date).toLocaleDateString()}</td>
                `;
                feedbackTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching feedback:', error));
});
