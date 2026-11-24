// Job seeker profile page: shows the saved profile and lets the user create or update it
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) return;

    const form = document.getElementById('profileForm');
    const formMessage = document.getElementById('formMessage');
    const summary = document.getElementById('profileSummary');

    // Repeatable single-value fields: list name -> input settings
    const LISTS = {
        mobileNumbers: { type: 'tel', placeholder: '10-digit mobile number', pattern: '\\d{10}', required: true },
        emails: { type: 'email', placeholder: 'Email address', required: true },
        skills: { type: 'text', placeholder: 'Skill', required: true },
        projects: { type: 'text', placeholder: 'Project details', required: true },
    };
    const EDUCATION_LEVELS = [
        ['class10', 'Class X'],
        ['class12', 'Class XII'],
        ['graduation', 'Graduation'],
        ['postgraduation', 'Postgraduation'],
        ['doctorate', 'Doctorate'],
    ];

    // A row can be removed only if another row of the same list is left
    function updateRemoveButtons(container) {
        const rows = container.querySelectorAll('.field-row');
        rows.forEach(row => { row.querySelector('.remove-btn').hidden = rows.length === 1; });
    }

    function addListField(listName, value = '') {
        const settings = LISTS[listName];
        const container = document.getElementById(`${listName}Container`);
        const row = document.createElement('div');
        row.className = 'field-row';

        const input = document.createElement('input');
        input.type = settings.type;
        input.name = `${listName}[]`;
        input.placeholder = settings.placeholder;
        input.value = value;
        if (settings.pattern) input.pattern = settings.pattern;
        // Only the first field of each list is mandatory
        input.required = settings.required && container.children.length === 0;

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'remove-btn';
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => { row.remove(); updateRemoveButtons(container); });

        row.append(input, remove);
        container.appendChild(row);
        updateRemoveButtons(container);
    }

    function addEducation(entry = {}) {
        const container = document.getElementById('educationContainer');
        const row = document.createElement('div');
        row.className = 'field-row education-entry';
        const required = container.children.length === 0 ? 'required' : '';
        row.innerHTML = `
            <select name="educationLevels[]">
                ${EDUCATION_LEVELS.map(([value, label]) =>
                    `<option value="${value}" ${entry.educationLevel === value ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
            <input type="text" name="institution[]" placeholder="Institution name" value="${escapeHtml(entry.institution)}" ${required}>
            <input type="text" name="percentage[]" placeholder="Percentage / CGPA" value="${escapeHtml(entry.percentage)}" ${required}>
            <input type="text" name="passingYear[]" placeholder="Passing year" value="${escapeHtml(entry.passingYear)}" pattern="\\d{4}" ${required}>
            <button type="button" class="remove-btn">Remove</button>
        `;
        row.querySelector('.remove-btn').addEventListener('click', () => { row.remove(); updateRemoveButtons(container); });
        container.appendChild(row);
        updateRemoveButtons(container);
    }

    function clearContainers() {
        Object.keys(LISTS).forEach(name => { document.getElementById(`${name}Container`).innerHTML = ''; });
        document.getElementById('educationContainer').innerHTML = '';
    }

    const levelLabel = (value) => (EDUCATION_LEVELS.find(([v]) => v === value) || [value, value])[1];
    const fileLine = (label, url) => (url ? `<a href="${escapeHtml(fileLink(url))}" target="_blank" rel="noopener">View ${label}</a>` : 'Not uploaded');

    function showSummary(profile) {
        const list = (values) => (values && values.length ? values.map(escapeHtml).join(', ') : '-');
        summary.innerHTML = `
            <h2>Your Profile</h2>
            <p><strong>Name:</strong> ${escapeHtml(profile.name)}</p>
            <p><strong>Gender:</strong> ${escapeHtml(profile.gender || '-')}</p>
            <p><strong>Date of Birth:</strong> ${formatDate(profile.dob) || '-'}</p>
            <p><strong>Mobile:</strong> ${list(profile.mobileNumbers)}</p>
            <p><strong>Emails:</strong> ${list(profile.emails)}</p>
            <p><strong>Education:</strong> ${(profile.education || []).map(e =>
                `${escapeHtml(levelLabel(e.educationLevel))} - ${escapeHtml(e.institution)} (${escapeHtml(e.percentage)}, ${escapeHtml(e.passingYear)})`
            ).join('; ') || '-'}</p>
            <p><strong>Skills:</strong> ${list(profile.skills)}</p>
            <p><strong>Projects:</strong> ${list(profile.projects)}</p>
            <p><strong>Certificate:</strong> ${fileLine('certificate', profile.certificate)}</p>
            <p><strong>Resume:</strong> ${fileLine('resume', profile.resume)}</p>
        `;
        summary.hidden = false;
    }

    function fillForm(profile) {
        clearContainers();
        document.getElementById('name').value = profile?.name || '';
        document.getElementById('gender').value = profile?.gender || '';
        document.getElementById('dob').value = profile?.dob ? new Date(profile.dob).toISOString().slice(0, 10) : '';

        Object.keys(LISTS).forEach(name => {
            const values = profile?.[name]?.length ? profile[name] : [name === 'emails' ? currentUser.email : ''];
            values.forEach(value => addListField(name, value));
        });
        (profile?.education?.length ? profile.education : [{}]).forEach(addEducation);

        document.getElementById('currentCertificate').innerHTML = profile?.certificate
            ? `Current: ${fileLine('certificate', profile.certificate)} (choose a file to replace it)` : '';
        document.getElementById('currentResume').innerHTML = profile?.resume
            ? `Current: ${fileLine('resume', profile.resume)} (choose a file to replace it)` : '';
        document.getElementById('formTitle').textContent = profile ? 'Update Your Profile' : 'Create Your Profile';
        document.getElementById('saveProfileBtn').textContent = profile ? 'Update Profile' : 'Save Profile';
    }

    async function loadProfile() {
        try {
            const { profile } = await api('/profile');
            if (profile) showSummary(profile);
            fillForm(profile);
        } catch (error) {
            showMessage(formMessage, error.message, 'error');
            fillForm(null);
        }
    }

    document.querySelectorAll('.add-btn').forEach(button => {
        button.addEventListener('click', () => addListField(button.dataset.list));
    });
    document.getElementById('addEducationBtn').addEventListener('click', () => addEducation());

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = document.getElementById('saveProfileBtn');
        button.disabled = true;
        try {
            const data = await api('/profile', { method: 'POST', form: new FormData(form) });
            showMessage(formMessage, data.message, 'success');
            showSummary(data.profile);
            fillForm(data.profile);
            document.getElementById('certificate').value = '';
            document.getElementById('resume').value = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            showMessage(formMessage, error.message, 'error');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            button.disabled = false;
        }
    });

    loadProfile();
});
