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

        const responseData = await response.json();

        if (!response.ok) {
            if (responseData.errors && responseData.errors.length > 0) {
                alert(`Validation errors:\n${responseData.errors.join('\n')}`);
            } else {
                alert(`${responseData.message}`);
            }
            return;
        }

        alert('Registration successful!');        
        window.location.href = 'Login.html';
    } catch (error) {
        // Display the error message
        alert('Registration failed. Please try again later');
    }
});