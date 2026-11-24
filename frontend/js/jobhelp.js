// Job seeker help request form
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) return;

    const form = document.getElementById('helpForm');
    const formMessage = document.getElementById('formMessage');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        try {
            const data = await api('/help', {
                method: 'POST',
                body: { issue: document.getElementById('helpIssue').value.trim() },
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
