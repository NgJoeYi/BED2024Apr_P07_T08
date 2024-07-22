document.addEventListener("DOMContentLoaded", function () {
    const token = sessionStorage.getItem('token');

    if (token) {
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


