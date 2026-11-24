// Registration page
const registerType = document.getElementById('registerType');
const companyField = document.getElementById('companyField');
const companyNameInput = document.getElementById('companyName');
const formMessage = document.getElementById('formMessage');

// Show the company name field only for company accounts
registerType.addEventListener('change', () => {
    const isCompany = registerType.value === 'company';
    companyField.style.display = isCompany ? 'block' : 'none';
    companyNameInput.required = isCompany;
});

document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = event.target.querySelector('button[type="submit"]');
    showMessage(formMessage, '');

    const body = {
        registerType: registerType.value,
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        companyName: registerType.value === 'company' ? companyNameInput.value.trim() : '',
    };

    button.disabled = true;
    try {
        const data = await api('/register', { method: 'POST', body });
        showMessage(formMessage, `${data.message} Redirecting to login...`, 'success');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    } catch (error) {
        showMessage(formMessage, error.message, 'error');
        button.disabled = false;
    }
});
