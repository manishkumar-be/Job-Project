// Company profile: view, then edit and save
document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) return;

    const form = document.getElementById('profileForm');
    const saveButton = document.getElementById('saveButton');
    const editButton = document.getElementById('editButton');
    const formMessage = document.getElementById('formMessage');
    const fields = [document.getElementById('companyName'), document.getElementById('aboutCompany')];

    // Read-only after saving; "Edit" unlocks the fields
    function setEditing(editing) {
        fields.forEach(field => { field.readOnly = !editing; });
        saveButton.style.display = editing ? 'inline-block' : 'none';
        editButton.style.display = editing ? 'none' : 'inline-block';
    }

    async function loadProfile() {
        try {
            const { profile, accountCompanyName } = await api('/company/profile');
            fields[0].value = profile?.companyName || accountCompanyName;
            fields[1].value = profile?.aboutCompany || '';
            setEditing(!profile);
        } catch (error) {
            showMessage(formMessage, error.message, 'error');
        }
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        saveButton.disabled = true;
        try {
            const data = await api('/company/profile', {
                method: 'PUT',
                body: { companyName: fields[0].value.trim(), aboutCompany: fields[1].value.trim() },
            });
            showMessage(formMessage, data.message, 'success');
            setEditing(false);
        } catch (error) {
            showMessage(formMessage, error.message, 'error');
        } finally {
            saveButton.disabled = false;
        }
    });

    editButton.addEventListener('click', () => {
        showMessage(formMessage, '');
        setEditing(true);
        fields[0].focus();
    });

    loadProfile();
});
