// document.addEventListener('DOMContentLoaded', function() {
//     const registerType = document.getElementById('registerType');
//     const companyField = document.getElementById('companyField');

//     registerType.addEventListener('change', function() {
//         if (registerType.value === 'company') {
//             companyField.style.display = 'block';
//         } else {
//             companyField.style.display = 'none';
//         }
//     });

// });

//     document.getElementById('loginForm').addEventListener('submit', function(event) {
//         event.preventDefault();
       
//         console.log("here")
//         // Collect data from form and send to server for login validation
//         const userType = document.getElementById('userType').value;
//         const email = document.getElementById('email').value;
//         const password = document.getElementById('password').value;
      
//         fetch('http://127.0.0.1:8080/login', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ userType, email, password })
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 window.location.href = `/${userType}.html`;
//             } else {
//                 document.getElementById('errorMessage').textContent = "Please enter your credentials again";
//             }
//         });
//     });

document.addEventListener('DOMContentLoaded', function () {
    const registerType = document.getElementById('registerType');
    const companyField = document.getElementById('companyField');

    // Show or hide company name field based on register type selection
    registerType.addEventListener('change', function () {
        if (registerType.value === 'company') {
            companyField.style.display = 'block';
        } else {
            companyField.style.display = 'none';
        }
    });

    // Login form submission
    document.getElementById('loginForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const userType = document.getElementById('userType').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        fetch('http://127.0.0.1:8080/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userType, email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = data.redirectTo;
            } else {
                document.getElementById('errorMessage').textContent = "Please enter your credentials again";
            }
        });
    });

   
   
});
