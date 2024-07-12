// document.addEventListener('DOMContentLoaded', function() {
//     // Check if the user is already logged in when the page loads
//     if (sessionStorage.getItem('token')) {
//         alert('You are already logged in! Redirecting to the home page...');
//         window.location.href = 'index.html';
//     }
// });

// Initialize the selected role as 'student' and set the button active
let selectedRole = 'student';
document.getElementById('student-btn').classList.add('active');

// Function to handle role button click
function handleRoleButtonClick(role) {
    selectedRole = role;
    // Remove 'active' class from both buttons
    document.getElementById('lecturer-btn').classList.remove('active');
    document.getElementById('student-btn').classList.remove('active');
    // Add 'active' class to the selected button
    document.getElementById(`${role}-btn`).classList.add('active');
}

// Add event listeners to role buttons
document.getElementById('lecturer-btn').addEventListener('click', function() {
    handleRoleButtonClick('lecturer');
});

document.getElementById('student-btn').addEventListener('click', function() {
    handleRoleButtonClick('student');
});

document.getElementById('register-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    formData.append('role', selectedRole);

    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();

        if (!response.ok) {
            if (responseData.errors && responseData.errors.length > 0) {
                alert(`Validation errors:\n${responseData.errors.join('\n')}`);
            } else {
                alert(`${responseData.message}`);
            }
            return;
        }

        alert('User registered successfully!');
        window.location.href = 'login.html'; // Redirect on successful login
    } catch (error) {
        alert('Registration failed. Please try again later');
    }
});