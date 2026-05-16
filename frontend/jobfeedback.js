// feedback.js
document.addEventListener('DOMContentLoaded', function () {
    const feedbackForm = document.getElementById('feedbackForm');

    feedbackForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const userEmail = document.getElementById('userEmail').value;
        const feedbackMessage = document.getElementById('feedbackMessage').value;

        const feedbackData = {
            userEmail,
            message: feedbackMessage,
            date: new Date().toISOString(),
        };

        // Send the feedback to the server
        fetch('http://localhost:8080/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feedbackData),
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message); // Display success message
                feedbackForm.reset(); // Clear the form
            })
            .catch(error => console.error('Error submitting feedback:', error));
    });
});
