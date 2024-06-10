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
        alert('Login successful!');
        // on successful login, redirect to homepage aka index.html
        window.location.href = 'index.html';
    } else {
        alert('Login failed!');
    }
});
