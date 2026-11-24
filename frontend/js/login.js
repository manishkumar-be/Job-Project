// Login page
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const errorMessage = document.getElementById('errorMessage');
    const button = event.target.querySelector('button[type="submit"]');
    showMessage(errorMessage, '');

    const userType = document.getElementById('userType').value;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    button.disabled = true;
    try {
        const data = await api('/login', { method: 'POST', body: { userType, email, password } });
        Session.save(data.token, data.user);
        // redirectTo is like "/jobseeker.html"; use it relative to this page's folder
        window.location.href = data.redirectTo.replace(/^\//, '');
    } catch (error) {
        showMessage(errorMessage, error.message, 'error');
    } finally {
        button.disabled = false;
    }
});
