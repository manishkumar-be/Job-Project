document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const userType = document.getElementById('userType').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMessage');

    if (!userType) {
        errorMsg.textContent = 'Please select a user type.';
        return;
    }

    errorMsg.textContent = '';

    fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (data.companyName) {
                sessionStorage.setItem('companyName', data.companyName);
            }
            window.location.href = data.redirectTo;
        } else {
            errorMsg.textContent = data.message || 'Invalid credentials. Please try again.';
        }
    })
    .catch(() => {
        errorMsg.textContent = 'Cannot connect to server. Please try again.';
    });
});
