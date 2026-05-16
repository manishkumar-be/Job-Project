document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const userType = document.getElementById('userType').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://127.0.0.1:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // window.location.href = data.redirectTo;
            // window.location.href = 'job.html';
            window.location.href = `/${userType}.html`;
        } else {
            document.getElementById('errorMessage').textContent = "Please enter your credentials again";
        }
    });
});
