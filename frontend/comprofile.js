document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profileForm');
    const saveButton = document.getElementById('saveButton');
    const editButton = document.getElementById('editButton');

    // Load existing profile data
    function loadProfile() {
        fetch('http://localhost:8080/companyprofiles')
            .then(response => response.json())
            .then(data => {
                if (data.companyName) {
                    document.getElementById('companyName').value = data.companyName;
                    document.getElementById('aboutCompany').value = data.aboutCompany;
                    saveButton.style.display = 'none';
                    editButton.style.display = 'inline-block';
                }
            })
            .catch(error => console.error('Error fetching profile:', error));
    }

    // Save profile
    saveButton.addEventListener('click', (event) => {
        event.preventDefault();

        const companyName = document.getElementById('companyName').value;
        const aboutCompany = document.getElementById('aboutCompany').value;

        fetch('http://localhost:8080/company/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyName, aboutCompany }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    loadProfile();
                } else {
                    alert('Error saving profile: ' + data.message);
                }
            })
            .catch(error => console.error('Error saving profile:', error));
    });

    // Edit profile
    editButton.addEventListener('click', (event) => {
        event.preventDefault();
        saveButton.style.display = 'inline-block';
        editButton.style.display = 'none';
    });

    // Load profile on page load
    loadProfile();
});
