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
        // on successful login, redirect to homepage aka index.html
        window.location.href = 'index.html';
    } else {
        const errorData = await response.json();
        alert(`${errorData.message}`);
    }
});
