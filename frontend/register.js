document.addEventListener('DOMContentLoaded', function () {
    const registerType = document.getElementById('registerType');
    const companyField = document.getElementById('companyField');

    registerType.addEventListener('change', function () {
        companyField.style.display = registerType.value === 'company' ? 'block' : 'none';
    });

    document.getElementById('registerForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const registerTypeVal = registerType.value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const companyName = document.getElementById('companyName').value;

        if (!registerTypeVal) {
            alert('Please select a registration type.');
            return;
        }

        fetch('http://localhost:8080/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registerType: registerTypeVal, email, password, companyName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                window.location.href = 'login.html';
            } else {
                alert(data.message || 'Registration failed. Please try again.');
            }
        })
        .catch(() => {
            alert('Cannot connect to server. Please try again.');
        });
    });
});
