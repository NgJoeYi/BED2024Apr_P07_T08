let alertShown = false; // Flag to ensure alert is shown only once

async function fetchWithAuth(url, options = {}) {
    const token = sessionStorage.getItem('token');
    if (!token) {
        if (!alertShown) {
            alert('No token found. Please log in.');
            alertShown = true;
            window.location.href = 'login.html';
        }
        return;
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(url, options);
        if (response.status === 401) {
            const errorData = await response.json();
            if (errorData.message === 'Token expired') {
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('role');
                sessionStorage.removeItem('userId');
                if (!alertShown) {
                    alert('Session expired. Please log in again.');
                    alertShown = true;
                    window.location.href = 'login.html';
                }
            } else {
                if (!alertShown) {
                    alert(errorData.message || 'Unauthorized access');
                    alertShown = true;
                    window.location.href = 'login.html';
                }
            }
            return null;
        }
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        if (!alertShown) {
            alert('An error occurred. Please try again.');
            alertShown = true;
        }
        return null;
    }
}

// note: need to include this as a script in html files. 
//       before being able to use it in other JS files. 
//       make sure to include it before any other scripts