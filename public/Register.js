// JavaScript for capturing role selection and submitting registration form

// Initialize the selected role as 'student'
let selectedRole = 'student';

// Function to handle role button click
function handleRoleButtonClick(role) {
    selectedRole = role;
    // Add or remove 'active' class to visually indicate the selected role
    document.getElementById('lecturer-btn').classList.toggle('active', role === 'lecturer');
    document.getElementById('student-btn').classList.toggle('active', role === 'student');
}

// Add event listeners to role buttons
document.getElementById('lecturer-btn').addEventListener('click', function() {
    handleRoleButtonClick('lecturer');
});

document.getElementById('student-btn').addEventListener('click', function() {
    handleRoleButtonClick('student');
});

// Add event listener to register form submission
document.getElementById('register-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    // Add selected role to form data
    formData.append('role', selectedRole);

    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    try {
        const response = await fetch('/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const result = await response.json();
        alert('Registration successful!');
    } catch (error) {
        // Display the error message
        alert(`Registration failed: ${error.message}`);
    }
});