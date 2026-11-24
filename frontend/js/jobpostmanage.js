// Admin: manage all job posts
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) return;

    const tableBody = document.querySelector('#jobPostsTable tbody');
    let jobs = [];

    async function loadJobPosts() {
        try {
            jobs = await api('/job-posts');
            if (jobs.length === 0) {
                tableBody.innerHTML = '<tr class="empty-row"><td colspan="7">No job posts.</td></tr>';
                return;
            }
            tableBody.innerHTML = jobs.map(job => `
                <tr>
                    <td>${escapeHtml(job.postName)}</td>
                    <td>${escapeHtml(job.companyName)}</td>
                    <td>${escapeHtml(job.location)}</td>
                    <td>${escapeHtml(job.salary)}</td>
                    <td>${escapeHtml(job.companyType || '-')}</td>
                    <td>${escapeHtml(job.workType || '-')}</td>
                    <td>
                        <button class="edit-btn" data-id="${escapeHtml(job._id)}">Edit</button>
                        <button class="delete-btn" data-id="${escapeHtml(job._id)}">Delete</button>
                    </td>
                </tr>`).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr class="empty-row"><td colspan="7">${escapeHtml(error.message)}</td></tr>`;
        }
    }

    // Ask for each value with prompt(); returns null if the admin cancels
    function askForChanges(job) {
        const questions = [
            ['postName', 'Job post name'],
            ['companyName', 'Company name'],
            ['location', 'Location'],
            ['salary', 'Salary'],
            ['companyType', 'Company type'],
            ['workType', 'Work type (Online, Offline or Hybrid)'],
        ];
        const changes = {};
        for (const [field, label] of questions) {
            const answer = prompt(`${label}:`, job[field] ?? '');
            if (answer === null) return null;
            changes[field] = answer.trim();
        }
        changes.salary = Number(changes.salary);
        return changes;
    }

    tableBody.addEventListener('click', async (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        const job = jobs.find(j => String(j._id) === button.dataset.id);
        if (!job) return;

        try {
            if (button.classList.contains('delete-btn')) {
                if (!confirm(`Delete the job post "${job.postName}"?`)) return;
                const data = await api(`/job-posts/${job._id}`, { method: 'DELETE' });
                alert(data.message);
            } else if (button.classList.contains('edit-btn')) {
                const changes = askForChanges(job);
                if (!changes) return;
                const data = await api(`/job-posts/${job._id}`, { method: 'PUT', body: changes });
                alert(data.message);
            }
            loadJobPosts();
        } catch (error) {
            alert(error.message);
        }
    });

    loadJobPosts();
});
