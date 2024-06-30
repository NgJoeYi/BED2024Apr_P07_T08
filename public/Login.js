document.getElementById('login-contact-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    const response = await fetch('/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        const user = await response.json();
        alert('Login successful!');
        sessionStorage.setItem('userId', user.id);
        sessionStorage.setItem('role', user.role); // Store role in sessionStorage
        sessionStorage.setItem('LecturerID', user.LecturerID); // Store LecturerID in sessionStorage if needed
        window.location.href = 'index.html'; 
    } else {
        const errorData = await response.json();
        alert(`${errorData.message}`);
    }
});
