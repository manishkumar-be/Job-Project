// Company job posts: create, edit and delete
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) return;

    const form = document.getElementById('jobPostForm');
    const tableBody = document.querySelector('#jobPostsTable tbody');
    const formMessage = document.getElementById('formMessage');
    const editingId = document.getElementById('editingId');
    const submitButton = document.getElementById('jobSubmitBtn');
    const cancelButton = document.getElementById('cancelEditBtn');
    const FIELDS = ['postName', 'location', 'salary', 'companyType', 'workType'];
    let jobs = [];

    async function loadJobPosts() {
        try {
            jobs = await api('/job-posts/mine');
            if (jobs.length === 0) {
                tableBody.innerHTML = '<tr class="empty-row"><td colspan="6">You have not posted any jobs yet.</td></tr>';
                return;
            }
            tableBody.innerHTML = jobs.map(job => `
                <tr>
                    <td>${escapeHtml(job.postName)}</td>
                    <td>${escapeHtml(job.location)}</td>
                    <td>${escapeHtml(job.salary)}</td>
                    <td>${escapeHtml(job.companyType || '-')}</td>
                    <td>${escapeHtml(job.workType || '-')}</td>
                    <td class="actions">
                        <button class="edit" data-id="${escapeHtml(job._id)}">Edit</button>
                        <button class="delete" data-id="${escapeHtml(job._id)}">Delete</button>
                    </td>
                </tr>`).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr class="empty-row"><td colspan="6">${escapeHtml(error.message)}</td></tr>`;
        }
    }

    function resetForm() {
        form.reset();
        editingId.value = '';
        document.getElementById('jobFormTitle').textContent = 'Create Job Post';
        submitButton.textContent = 'Create Job Post';
        cancelButton.hidden = true;
    }

    function startEditing(job) {
        editingId.value = job._id;
        FIELDS.forEach(field => { document.getElementById(field).value = job[field] ?? ''; });
        document.getElementById('jobFormTitle').textContent = 'Edit Job Post';
        submitButton.textContent = 'Save Changes';
        cancelButton.hidden = false;
        showMessage(formMessage, '');
        form.scrollIntoView({ behavior: 'smooth' });
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const body = {};
        FIELDS.forEach(field => { body[field] = document.getElementById(field).value.trim(); });
        body.salary = Number(body.salary);

        const id = editingId.value;
        submitButton.disabled = true;
        try {
            const data = await api(id ? `/job-posts/${id}` : '/job-posts', { method: id ? 'PUT' : 'POST', body });
            showMessage(formMessage, data.message, 'success');
            resetForm();
            loadJobPosts();
        } catch (error) {
            showMessage(formMessage, error.message, 'error');
        } finally {
            submitButton.disabled = false;
        }
    });

    cancelButton.addEventListener('click', () => {
        resetForm();
        showMessage(formMessage, '');
    });

    tableBody.addEventListener('click', async (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        const job = jobs.find(j => String(j._id) === button.dataset.id);
        if (!job) return;

        if (button.classList.contains('edit')) {
            startEditing(job);
        } else if (button.classList.contains('delete')) {
            if (!confirm(`Delete the job post "${job.postName}"?`)) return;
            try {
                const data = await api(`/job-posts/${job._id}`, { method: 'DELETE' });
                showMessage(formMessage, data.message, 'success');
                if (editingId.value === String(job._id)) resetForm();
                loadJobPosts();
            } catch (error) {
                showMessage(formMessage, error.message, 'error');
            }
        }
    });

    loadJobPosts();
});
