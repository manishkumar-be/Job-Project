// Job seeker feedback form
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) return;

    const form = document.getElementById('feedbackForm');
    const formMessage = document.getElementById('formMessage');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        try {
            const data = await api('/feedback', {
                method: 'POST',
                body: { message: document.getElementById('feedbackMessage').value.trim() },
            });
            showMessage(formMessage, data.message, 'success');
            form.reset();
        } catch (error) {
            showMessage(formMessage, error.message, 'error');
        } finally {
            button.disabled = false;
        }
    });
});
