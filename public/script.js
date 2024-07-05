document.addEventListener("DOMContentLoaded", function () {
    const token = sessionStorage.getItem('token');

    if (token) {
        // User is logged in, show the additional menu items
        document.getElementById('nav-courses').style.display = 'block';
        document.getElementById('nav-activityfeed').style.display = 'block';
        document.getElementById('nav-account').style.display = 'block';

        // Hide the login and sign-up links
        document.getElementById('navbar-login').style.display = 'none';
        document.getElementById('navbar-signup').style.display = 'none';
    } else {
        // Add event listener to the 'View All Courses' link
        document.getElementById('view-all-courses').addEventListener('click', function(event) {
            event.preventDefault();
            alert('You must be logged in to view the courses.');
        });
    }
});