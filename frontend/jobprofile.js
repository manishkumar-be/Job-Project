// Function to dynamically add fields for mobile numbers, emails, skills, etc.
function addField(containerId, fieldType, fieldName, placeholder = '') {
    const container = document.getElementById(containerId);
    const input = document.createElement('input');
    input.type = fieldType;
    input.name = fieldName;
    input.placeholder = placeholder;
    container.appendChild(input);
}

// Function to dynamically add education entries with specific fields
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
