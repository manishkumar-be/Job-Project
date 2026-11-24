// Admin: manage user accounts
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) return;

    const tableBody = document.querySelector('#usersTable tbody');
    const ROLE_LABELS = { jobSeeker: 'Job Seeker', company: 'Company', admin: 'Admin' };
    let users = [];

    async function loadUsers() {
        try {
            users = await api('/users');
            if (users.length === 0) {
                tableBody.innerHTML = '<tr class="empty-row"><td colspan="5">No users.</td></tr>';
                return;
            }
            tableBody.innerHTML = users.map(user => {
                const isMe = String(user._id) === String(currentUser.id);
                return `
                <tr>
                    <td>${escapeHtml(user.email)}${isMe ? ' (you)' : ''}</td>
                    <td>${escapeHtml(ROLE_LABELS[user.role] || user.role)}</td>
                    <td>${escapeHtml(user.companyName || 'N/A')}</td>
                    <td>${formatDate(user.createdAt) || 'N/A'}</td>
                    <td>
                        <button class="edit-btn" data-id="${escapeHtml(user._id)}">Edit</button>
                        <button class="delete-btn" data-id="${escapeHtml(user._id)}" ${isMe ? 'disabled title="You cannot delete yourself"' : ''}>Delete</button>
                    </td>
                </tr>`;
            }).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr class="empty-row"><td colspan="5">${escapeHtml(error.message)}</td></tr>`;
        }
    }

    function askForChanges(user) {
        const email = prompt('Email:', user.email);
        if (email === null) return null;
        const role = prompt('Role (jobSeeker, company or admin):', user.role);
        if (role === null) return null;
        if (!ROLE_LABELS[role.trim()]) {
            alert('Role must be jobSeeker, company or admin.');
            return null;
        }
        let companyName = '';
        if (role.trim() === 'company') {
            companyName = prompt('Company name:', user.companyName || '');
            if (companyName === null) return null;
        }
        return { email: email.trim(), role: role.trim(), companyName: companyName.trim() };
    }

    tableBody.addEventListener('click', async (event) => {
        const button = event.target.closest('button');
        if (!button || button.disabled) return;
        const user = users.find(u => String(u._id) === button.dataset.id);
        if (!user) return;

        try {
            if (button.classList.contains('delete-btn')) {
                if (!confirm(`Delete the account ${user.email}?`)) return;
                const data = await api(`/users/${user._id}`, { method: 'DELETE' });
                alert(data.message);
            } else if (button.classList.contains('edit-btn')) {
                const changes = askForChanges(user);
                if (!changes) return;
                const data = await api(`/users/${user._id}`, { method: 'PUT', body: changes });
                alert(data.message);
            }
            loadUsers();
        } catch (error) {
            alert(error.message);
        }
    });

    loadUsers();
});
