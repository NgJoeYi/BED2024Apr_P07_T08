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



//for contact us page 
if(document.getElementById('contact-form')){
    document.getElementById('contact-form').addEventListener('submit', function (e) {
        e.preventDefault();
        showLottieAnimation();
    });
}


function showLottieAnimation() {
    const contactForm = document.getElementById('contact-form');
    const lottieContainer = document.getElementById('lottie-container');
    
    // Hide the form
    contactForm.style.display = 'none';
    
    // Display the Lottie container
    lottieContainer.style.display = 'block';

    // Load and play the Lottie animation
    lottie.loadAnimation({
        container: lottieContainer,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: 'https://lottie.host/3d88f376-ddaf-4815-825a-2eab7b12d0f7/SAeCRfEoQW.json' // Replace with your own Lottie animation URL
    });
}