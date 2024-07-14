async function fetchWithAuth(url, options = {}) {
    const token = sessionStorage.getItem('token');
    if (!token) {
        alert('No token found. Please log in.');
        window.location.href = 'login.html';
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
                alert('Session expired. Please log in again.');
                window.location.href = 'login.html';
            } else {
                alert(errorData.message || 'Unauthorized access');
            }
            return null;
        }
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        alert('An error occurred. Please try again.');
        return null;
    }
}

// note: need to include this as a script in html files. 
//       before being able to use it in other JS files. 
//       make sure to include it before any other scripts