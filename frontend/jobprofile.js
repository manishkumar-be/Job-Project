function addField(containerId, fieldType, fieldName, placeholder) {
    const container = document.getElementById(containerId);
    const input = document.createElement('input');
    input.type = fieldType;
    input.name = fieldName;
    if (placeholder) input.placeholder = placeholder;
    container.appendChild(input);
}

function addEducation() {
    const educationContainer = document.getElementById('educationContainer');
    const entry = document.createElement('div');
    entry.className = 'education-entry';
    entry.innerHTML = `
        <select name="educationLevels[]">
            <option value="class10">Class X</option>
            <option value="class12">Class XII</option>
            <option value="graduation">Graduation</option>
            <option value="postgraduation">Postgraduation</option>
            <option value="doctorate">Doctorate</option>
        </select>
        <input type="text" name="institution[]" placeholder="Institution Name" required>
        <input type="text" name="percentage[]" placeholder="Percentage" required>
        <input type="text" name="passingYear[]" placeholder="Passing Year" required>
    `;
    educationContainer.appendChild(entry);
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('profileForm');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(form);

        fetch('http://localhost:8080/jobprofile', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        });
    });
});
