// Load the profile data or show the form
async function loadProfile() {
    try {
        const response = await fetch('/profiles');
        const profiles = await response.json();

        const mainContent = document.getElementById('mainContent');
        if (profiles.length > 0) {
            const profile = profiles[0];
            renderProfileView(mainContent, profile);
        } else {
            renderProfileForm(mainContent);
        }
    } catch (err) {
        console.error("Error loading profile:", err);
    }
}

function renderProfileView(container, profile) {
    container.innerHTML = `
        <div class="profile-view">
            <h2>Profile Details</h2>
            <h3>Name: ${profile.name}</h3>
            <p>Gender: ${profile.gender}</p>
            <p>Date of Birth: ${new Date(profile.dob).toLocaleDateString()}</p>
            <p>Mobile Numbers: ${profile.mobileNumbers.join(', ')}</p>
            <p>Emails: ${profile.emails.join(', ')}</p>
            <p>Skills: ${profile.skills.join(', ')}</p>
            <p>Projects: ${profile.projects.join(', ')}</p>
            <button onclick="editProfile()">Edit Profile</button>
        </div>
    `;
}

function renderProfileForm(container, profile = null) {
    container.innerHTML = `
        <form id="profileForm" action="/saveProfile" method="POST" enctype="multipart/form-data">
            <h2>${profile ? 'Edit' : 'Create'} Profile</h2>
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" value="${profile?.name || ''}" required>
            <label for="gender">Gender:</label>
            <select id="gender" name="gender" required>
                <option value="male" ${profile?.gender === "male" ? "selected" : ""}>Male</option>
                <option value="female" ${profile?.gender === "female" ? "selected" : ""}>Female</option>
                <option value="third" ${profile?.gender === "third" ? "selected" : ""}>Third Gender</option>
            </select>
            <label for="dob">Date of Birth:</label>
            <input type="date" id="dob" name="dob" value="${profile?.dob || ''}" required>
            <!-- Add more fields as needed -->
            <button type="submit">${profile ? 'Update' : 'Save'} Profile</button>
        </form>
    `;
}

function editProfile() {
    const mainContent = document.getElementById('mainContent');
    loadProfileForm(mainContent);
}

// Load the profile on page load
window.onload = loadProfile;
