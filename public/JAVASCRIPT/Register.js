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

// Add event listener to the registration form
document.getElementById('register-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(this); // Create a FormData object from the form
    formData.append('role', selectedRole); // Append the selected role to the form data

    const data = {}; // Initialize an empty object to store form data
    formData.forEach((value, key) => {
        data[key] = value; // Populate the object with form data
    });

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Set the content type to JSON
            },
            body: JSON.stringify(data) // Convert the form data object to JSON
        });

        const responseData = await response.json(); // Parse the JSON response

        if (!response.ok) {
            if (responseData.errors && responseData.errors.length > 0) {
                alert(`Validation errors:\n${responseData.errors.join('\n')}`); // Show validation errors
            } else {
                alert(`${responseData.message}`); // Show other error messages
            }
            return;
        }

        alert('User registered successfully!');  // Show success message
        window.location.href = 'login.html'; // Redirect on successful login
    } catch (error) {
        alert('Registration failed. Please try again later'); // Show error message on failure
    }
});