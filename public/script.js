document.addEventListener("DOMContentLoaded", function () {
    // Check if the user is logged in (this example assumes a token in session storage)
    const token = sessionStorage.getItem('token');

    if (token) {
        // User is logged in, show the additional menu items
        document.getElementById('nav-courses').style.display = 'block';
        document.getElementById('nav-activityfeed').style.display = 'block';
        document.getElementById('nav-account').style.display = 'block';

        // Hide the login and sign-up links
        document.getElementById('navbar-login').style.display = 'none';
        document.getElementById('navbar-signup').style.display = 'none';
    }
});
