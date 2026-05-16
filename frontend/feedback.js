document.addEventListener('DOMContentLoaded', function () {
    const feedbackTableBody = document.querySelector('#feedbackTable tbody');

    // Fetch feedback from the server
    fetch('http://localhost:8080/feedback')
        .then(response => response.json())
        .then(feedbackList => {
           
            feedbackTableBody.innerHTML = '';
            feedbackList.forEach(feedback => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${feedback["User Email"]}</td>
                    <td>${feedback.Message}</td>
                    <td>${new Date(feedback.date).toLocaleDateString()}</td>
                `;
                feedbackTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching feedback:', error));
});
