let alertShown = false; // Flag to ensure alert is shown only once

// Function to fetch data with authentication
async function fetchWithAuth(url, options = {}) {
    const token = sessionStorage.getItem('token'); // Retrieve the token from session storage
    if (!token) { // If no token is found
        if (!alertShown) {
            alert('No token found. Please log in.'); // Alert the user to log in
            alertShown = true; // Set flag to prevent multiple alerts
            window.location.href = 'login.html'; // Redirect to login page
        }
        return; // Exit function
    }

    // Add the Authorization header with the token
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };

    // If FormData is being used, do not set Content-Type to application/json cos browser already handles this
    // for form data, browser uses multi part/ formdata
    if (!(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(url, options); // Perform the fetch request
        if (response.status === 401) { // If the response status is 401 (Unauthorized)
            const errorData = await response.json();
            if (errorData.message === 'Token expired') { // If the token has expired
                sessionStorage.removeItem('token'); // Remove token from session storage
                sessionStorage.removeItem('role');
                sessionStorage.removeItem('userId');
                if (!alertShown) {
                    alert('Session expired. Please log in again.'); // Alert the user
                    alertShown = true; // Set flag to prevent multiple alerts
                    window.location.href = 'login.html'; // Redirect to login page
                }
                return null;
            } else { // For other unauthorized access errors
                if (!alertShown) {
                    alert(errorData.message || 'Unauthorized access'); // Alert the user
                    alertShown = true; // Set flag to prevent multiple alerts
                    window.location.href = 'login.html'; // Redirect to login page
                }
            }
            return null; // Return null for unauthorized response
        }
        return response; // Return the response if no errors
    } catch (error) {
        console.error('Fetch error:', error); // Log fetch errors
        if (!alertShown) {
            alert('An error occurred. Please try again.');  // Alert the user of the error
            alertShown = true; // Set flag to prevent multiple alerts
        }
        return null;  // Return null if fetch fails
    }
}

// note: need to include this as a script in html files. 
//       before being able to use it in other JS files. 
//       make sure to include it before any other scripts