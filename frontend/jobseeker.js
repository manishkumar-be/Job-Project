document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');

    // Links
    document.getElementById('profileLink').addEventListener('click', () => loadFeature('Profile'));
    document.getElementById('jobListingLink').addEventListener('click', () => loadFeature('Job Listings'));
    document.getElementById('reviewsLink').addEventListener('click', () => loadFeature('Company Reviews'));
    document.getElementById('questionBankLink').addEventListener('click', () => loadFeature('Question Bank'));
    document.getElementById('applicationTrackerLink').addEventListener('click', () => loadFeature('Application Tracker'));

    // Load feature content
    function loadFeature(feature) {
        content.innerHTML = `<h2>${feature}</h2><p>This section is under construction.</p>`;
    }
});
