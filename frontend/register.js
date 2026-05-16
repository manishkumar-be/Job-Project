 // Register form submission
document.getElementById('registerForm').addEventListener('submit', function (event) {
    console.log("button clicked");
    event.preventDefault();

    const registerType = document.getElementById('registerType').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const companyName = document.getElementById('companyName').value;
    console.log("login js ", registerType, email, password, companyName);

    fetch('http://127.0.0.1:8080/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registerType, email, password, companyName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            // window.location.href = 'job.html';
            window.location.href = 'login.html';
        } else {
            alert(data.message);
        }
    });
});