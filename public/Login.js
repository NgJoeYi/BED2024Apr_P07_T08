document.getElementById('login-contact-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevents the page from reloading automatically
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Function to fetch lecturer ID
    const fetchLecturerID = async () => {
        try {
            const response = await fetch('/current-user/lecturerID/' + sessionStorage.getItem('userId'));
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json(); // Assuming the API returns JSON with { lecturerID: 'someID' }
        } catch (error) {
            console.error('Error fetching lecturerID: ', error);
            return null;
        }
    };

    try {
        const loginResponse = await fetch('/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (loginResponse.ok) {
            const user = await loginResponse.json();
            alert('Login successful!');
// --------------------------------------- JWT ---------------------------------------
            //sessionStorage.setItem('token', data.token);
// --------------------------------------- JWT ---------------------------------------
            sessionStorage.setItem('userId', user.id);
            sessionStorage.setItem('role', user.role); // Store role in sessionStorage

            // Fetch and store LecturerID only if the role matches
            if (user.role === 'lecturer') {
                const lecturerInfo = await fetchLecturerID();
                if (lecturerInfo && lecturerInfo.lecturerID) {
                    sessionStorage.setItem('LecturerID', lecturerInfo.lecturerID);
                } else {
                    console.log('Failed to retrieve lecturer ID');
                }
            }

            window.location.href = 'index.html'; // Redirect on successful login
        } else {
            const errorData = await loginResponse.json();
            alert(errorData.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login.');
    }
});
