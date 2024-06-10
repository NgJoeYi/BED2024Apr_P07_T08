// Select the header, hamburger button, and close menu button elements
const header = document.querySelector("header");
const hamburgerBtn = document.querySelector("#hamburger-btn");
const closeMenuBtn = document.querySelector("#close-menu-btn");

// Toggle mobile menu on hamburger button click
hamburgerBtn.addEventListener("click", () => header.classList.toggle("show-mobile-menu"));
// This line adds a click event listener to the hamburger button.
// When the button is clicked, it toggles the 'show-mobile-menu' class on the header element.

// Close mobile menu on close button click
closeMenuBtn.addEventListener("click", () => hamburgerBtn.click());
// This line adds a click event listener to the close menu button.
// When the button is clicked, it programmatically triggers a click on the hamburger button.

// end of menu button 


// Feature 1: Slideshow functionality

// Initialize slide index
let slideIndex = 1;
// Show the first slide
showSlides(slideIndex);

// Function to move to the next or previous slide
function plusSlide(n) {
showSlides(slideIndex += n);
}

// Function to display slides
function showSlides(n) {
let i;
// Get all slides
const slides = document.getElementsByClassName("mySlides");
// If the index is out of bounds, reset it
if (n > slides.length) { slideIndex = 1; }
if (n < 1) { slideIndex = slides.length; }
// Hide all slides
for (i = 0; i < slides.length; i++) {
  slides[i].style.display = "none";
}
// Display the current slide
slides[slideIndex - 1].style.display = "block";
// Set a timeout to move to the next slide automatically after 10 seconds
setTimeout(function () {
  plusSlide(1);
}, 10000);
}

// Function to move to the previous slide
function prevSlide() {
plusSlide(-1);
}

// Function to move to the next slide
function nextSlide() {
plusSlide(1);
}

// Start automatic slideshow
showSlides(slideIndex);


// Feature 2: Navbar color change on scroll

// Add event listener for scrolling
window.addEventListener('scroll', function() {
  // Select the navbar element
  var navbar = document.querySelector('.navbar');
  // Check scroll position
  if (window.scrollY > 0) {
    // Change navbar background color to white
    navbar.style.backgroundColor = "#fff";
    // Change color of nav items to black
    navbar.querySelectorAll('a').forEach(function(link) {
      link.style.color = "black";
    });
  } else {
    // Change navbar background color to transparent
    navbar.style.backgroundColor = "transparent";
    // Change color of nav items to white or original color
    navbar.querySelectorAll('a').forEach(function(link) {
      link.style.color = "white";
    });
  }
  });


  // Feature 3: Popup functionality

// Execute when the window is loaded
window.addEventListener("load", function () {
  // Set a timeout function to execute after 2000 milliseconds (2 seconds)
  setTimeout(function () {
      // Open the popup
      openPopup();
  }, 2000);
  });
  
  // Add a click event listener to the element with id 'close'
  document.querySelector("#close").addEventListener("click", function () {
  // Close the popup when the 'close' element is clicked
  closePopup();
  });
  
  // Function to open the popup
  function openPopup() {
  document.querySelector(".popup").style.display = "block";
  }
  
  // Function to close the popup
  function closePopup() {
  document.querySelector(".popup").style.display = "none";
  }

//Feature  4
// Select relevant HTML elements for image filtering
// Function to filter images based on category
function filterImages(category) {
  // Get all elements with the class 'card'
  const items = document.querySelectorAll('.card');

  // Loop through each item
  items.forEach(item => {
      // Get the value of the 'data-name' attribute of the current item
      const dataCategory = item.getAttribute('data-name');

      // Check if the category is 'all' or matches the data-category of the item
      if (category === 'all' || dataCategory === category) {
          // Display the item
          item.style.display = 'block';
      } else {
          // Hide the item
          item.style.display = 'none';
      }
  });
}













 