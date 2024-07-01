document.getElementById('login-contact-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevents the page from reloading automatically
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

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
            sessionStorage.setItem('token', user.token);
// --------------------------------------- JWT ---------------------------------------
            // sessionStorage.setItem('userId', user.id);
            // sessionStorage.setItem('role', user.role); // Store role in sessionStorage
            
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
