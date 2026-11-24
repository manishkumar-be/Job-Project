// Job listings: search jobs and apply with a resume
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) return;

    const jobList = document.getElementById('job-list');
    const modal = document.getElementById('apply-modal');
    const applicationForm = document.getElementById('application-form');
    let allJobs = [];
    let appliedJobIds = new Set();

    function displayJobs(jobs) {
        if (jobs.length === 0) {
            jobList.innerHTML = `<p class="empty-state">${allJobs.length ? 'No jobs match your search.' : 'No jobs have been posted yet.'}</p>`;
            return;
        }
        jobList.innerHTML = jobs.map(job => {
            const applied = appliedJobIds.has(String(job._id));
            return `
                <div class="job-post">
                    <h3>${escapeHtml(job.postName)}</h3>
                    <p><span>Company:</span> ${escapeHtml(job.companyName)}</p>
                    <p><span>Location:</span> ${escapeHtml(job.location)}</p>
                    <p><span>Salary:</span> ${escapeHtml(job.salary)}</p>
                    <p><span>Company Type:</span> ${escapeHtml(job.companyType || '-')}</p>
                    <p><span>Work Type:</span> ${escapeHtml(job.workType || '-')}</p>
                    <button class="apply-btn" data-id="${escapeHtml(job._id)}" ${applied ? 'disabled' : ''}>
                        ${applied ? 'Applied' : 'Apply'}
                    </button>
                </div>`;
        }).join('');
    }

    function filterJobs() {
        const text = (id) => document.getElementById(id).value.trim().toLowerCase();
        const number = (id) => {
            const value = document.getElementById(id).value;
            return value === '' ? null : Number(value);
        };
        const contains = (value, term) => !term || String(value || '').toLowerCase().includes(term);

        const postName = text('post-name');
        const companyName = text('company-name');
        const location = text('location');
        const companyType = text('company-type');
        const workType = text('work-type');
        const minSalary = number('min-salary');
        const maxSalary = number('max-salary');

        displayJobs(allJobs.filter(job =>
            contains(job.postName, postName) &&
            contains(job.companyName, companyName) &&
            contains(job.location, location) &&
            contains(job.companyType, companyType) &&
            (!workType || String(job.workType || '').toLowerCase() === workType) &&
            (minSalary === null || Number(job.salary) >= minSalary) &&
            (maxSalary === null || Number(job.salary) <= maxSalary)
        ));
    }

    function openModal(job) {
        applicationForm.reset();
        document.getElementById('job-id').value = job._id;
        document.getElementById('apply-job-title').textContent = `${job.postName} at ${job.companyName}`;
        document.getElementById('applicant-email').value = currentUser.email;
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    async function loadJobs() {
        try {
            const [jobs, myApplications] = await Promise.all([api('/job-posts'), api('/applications/mine')]);
            allJobs = jobs;
            appliedJobIds = new Set(myApplications.map(a => String(a.jobId)));
            filterJobs();
        } catch (error) {
            jobList.innerHTML = `<p class="message error">${escapeHtml(error.message)}</p>`;
        }
    }

    document.getElementById('search-form').addEventListener('submit', (event) => {
        event.preventDefault();
        filterJobs();
    });
    document.getElementById('clearSearch').addEventListener('click', () => {
        document.getElementById('search-form').reset();
        filterJobs();
    });

    jobList.addEventListener('click', (event) => {
        const button = event.target.closest('.apply-btn');
        if (!button) return;
        const job = allJobs.find(j => String(j._id) === button.dataset.id);
        if (job) openModal(job);
    });

    document.getElementById('closeModal').addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });

    applicationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = document.getElementById('submitApplicationBtn');
        const application = {
            jobId: document.getElementById('job-id').value,
            name: document.getElementById('applicant-name').value.trim(),
            phone: document.getElementById('applicant-phone').value.trim(),
            email: document.getElementById('applicant-email').value.trim(),
        };
        const formData = new FormData();
        formData.append('resume', document.getElementById('applicant-resume').files[0]);
        formData.append('application', JSON.stringify(application));

        button.disabled = true;
        try {
            const data = await api('/applications', { method: 'POST', form: formData });
            alert(data.message);
            closeModal();
            appliedJobIds.add(application.jobId);
            filterJobs();
        } catch (error) {
            alert(error.message);
        } finally {
            button.disabled = false;
        }
    });

    loadJobs();
});
