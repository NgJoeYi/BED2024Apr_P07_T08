// Event listener for DOMContentLoaded to handle UI elements based on authentication state
document.addEventListener("DOMContentLoaded", function () {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');

    if (token) {
        // If token exists, hide login and sign-up links
        document.getElementById('navbar-login').style.display = 'none';
        document.getElementById('navbar-signup').style.display = 'none';
    } else {
        // If no token, add an event listener to the 'View All Courses' link
        document.getElementById('view-all-courses').addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default action of the link
            alert('You must be logged in to view the courses.'); // Show alert message
        });
    }
});





// Event listener for the 'submit' event on the contact form
document.getElementById('contact-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from submitting normally
    showLottieAnimation(); // Call function to show the Lottie animation
});

// Function to show Lottie animation
function showLottieAnimation() {
    // Get references to the contact form and Lottie container elements
    const contactForm = document.getElementById('contact-form');
    const lottieContainer = document.getElementById('lottie-container');
    
    // Hide the contact form
    contactForm.style.display = 'none';
    
    // Display the Lottie animation container
    lottieContainer.style.display = 'block';

    // Load and play the Lottie animation
    lottie.loadAnimation({
        container: lottieContainer, // The DOM element where the animation will be rendered
        renderer: 'svg', // Render using SVG
        loop: false, // Animation will not loop
        autoplay: true, // Animation will play automatically
        path: 'https://lottie.host/3d88f376-ddaf-4815-825a-2eab7b12d0f7/SAeCRfEoQW.json' // URL to the Lottie animation JSON file
    });
}
