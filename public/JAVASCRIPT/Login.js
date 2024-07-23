// Add event listener to the login form
document.getElementById('login-contact-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevents the page from reloading automatically
    const formData = new FormData(this); // Create a FormData object from the form
    const data = {}; // Initialize an empty object to store form data
    formData.forEach((value, key) => {
        data[key] = value;  // Populate the object with form data
    });

    try {
        // Send a POST request to the '/login' endpoint with the form data in JSON format
        const loginResponse = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Set the content type to JSON
            },
            body: JSON.stringify(data) // Convert the form data object to JSON
        });

        if (loginResponse.ok) { // Check if the response status is OK (200-299)
            const user = await loginResponse.json(); // Parse the JSON response
            alert('Login successful!'); // Show a success message
// --------------------------------------- JWT ---------------------------------------
            // Store JWT and user details in sessionStorage
            sessionStorage.setItem('token', user.token);
            sessionStorage.setItem('role', user.role);
            sessionStorage.setItem('userId', user.userId);
// --------------------------------------- JWT ---------------------------------------
            // sessionStorage.setItem('userId', user.id);
            // sessionStorage.setItem('role', user.role); // Store role in sessionStorage
            
            window.location.href = 'index.html'; // Redirect on successful login
        } else {
            const errorData = await loginResponse.json(); // Parse the JSON error response
            alert(errorData.message || 'Login failed'); // Show the error message
        }
    } catch (error) {
        console.error('Login error:', error); // Log any errors that occur during the fetch request
        alert('An error occurred during login.');  // Show a generic error message
    }
});