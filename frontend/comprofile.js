document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profileForm');
    const saveButton = document.getElementById('saveButton');
    const editButton = document.getElementById('editButton');

    // Pre-fill company name from session if available
    const storedCompanyName = sessionStorage.getItem('companyName');

    function loadProfile() {
        const url = storedCompanyName
            ? `http://localhost:8080/company/profile?companyName=${encodeURIComponent(storedCompanyName)}`
            : 'http://localhost:8080/company/profile';

        fetch(url)
            .then(response => {
                if (response.status === 404) return null;
                return response.json();
            })
            .then(data => {
                if (data && data.companyName) {
                    document.getElementById('companyName').value = data.companyName;
                    document.getElementById('aboutCompany').value = data.aboutCompany;
                    saveButton.style.display = 'none';
                    editButton.style.display = 'inline-block';
                } else if (storedCompanyName) {
                    document.getElementById('companyName').value = storedCompanyName;
                }
            })
            .catch(error => console.error('Error fetching profile:', error));
    }

    form.addEventListener('submit', (event) => {
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
                saveButton.style.display = 'none';
                editButton.style.display = 'inline-block';
            } else {
                alert('Error saving profile: ' + data.message);
            }
        })
        .catch(error => console.error('Error saving profile:', error));
    });

    editButton.addEventListener('click', () => {
        saveButton.style.display = 'inline-block';
        editButton.style.display = 'none';
    });

    loadProfile();
});
