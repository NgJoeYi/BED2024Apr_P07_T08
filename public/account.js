// Select the header, hamburger button, and close menu button elements
const header = document.querySelector("header");
const hamburgerBtn = document.querySelector("#hamburger-btn");
const closeMenuBtn = document.querySelector("#close-menu-btn");

// Toggle mobile menu on hamburger button click
hamburgerBtn.addEventListener("click", () => header.classList.toggle("show-mobile-menu"));

// Close mobile menu on close button click
closeMenuBtn.addEventListener("click", () => hamburgerBtn.click());

// Feature 1: Slideshow functionality
if (document.querySelectorAll('.mySlides').length > 0) {
  let slideIndex = 1;

  function plusSlides(n) {
    slideIndex += n;
    showSlides(slideIndex);

    function showSlides(n) {
      const slides = document.getElementsByClassName("mySlides");

      if (n > slides.length) { slideIndex = 1; }
      if (n < 1) { slideIndex = slides.length; }

      for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
      }

      slides[slideIndex - 1].style.display = "block";
    }

    // Automatically move to the next slide after 10 seconds
    setTimeout(() => plusSlides(1), 10000);
  }

  // Initialize the slideshow
  plusSlides(0);

  function prevSlide() {
    plusSlides(-1);
  }

  function nextSlide() {
    plusSlides(1);
  }
}

// Feature 2: Navbar color change on scroll
if (document.body.id !== 'account-page') {
  window.addEventListener('scroll', function() {
    var navbar = document.querySelector('.navbar');
    if (window.scrollY > 0) {
      navbar.style.backgroundColor = "#fff";
      navbar.querySelectorAll('a').forEach(function(link) {
        link.style.color = "black";
      });
    } else {
      navbar.style.backgroundColor = "transparent";
      navbar.querySelectorAll('a').forEach(function(link) {
        link.style.color = "white";
      });
    }
  });
}

// Feature 3: Image filtering functionality
function filterImages(category) {
  const items = document.querySelectorAll('.card');

  items.forEach(item => {
    const dataCategory = item.getAttribute('data-name');

    if (category === 'all' || dataCategory === category) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// Feature 4: Username editing functionality in account.html
document.getElementById('edit-icon').addEventListener('click', function() {
  const editAccountDetails = document.getElementById('edit-account-details');
  editAccountDetails.style.display = editAccountDetails.style.display === 'none' || editAccountDetails.style.display === '' ? 'block' : 'none';
});

document.getElementById('save-changes').addEventListener('click', function() {
  const newUsername = document.getElementById('edit-name').value;
  const newBirthDate = document.getElementById('edit-birth-date').value;
  const newEmail = document.getElementById('edit-email').value;
  
  // Update the profile info
  document.querySelector('.profile-info .user-name').textContent = newUsername;

  // Update all elements with the class 'user-name' in reviews and comments
  document.querySelectorAll('.review-info .user-name, .comment-user-info .user-name').forEach(element => {
    element.textContent = newUsername;
  });

  // Hide the edit section
  document.getElementById('edit-account-details').style.display = 'none';
});


// Feature 5: Popup functionality
// Define the popup functions outside the conditional block
function openPopup() {
  if (document.querySelectorAll('.popup').length > 0) {
    document.querySelector(".popup").style.display = "block";
  }
}

function closePopup() {
  if (document.querySelectorAll('.popup').length > 0) {
    document.querySelector(".popup").style.display = "none";
  }
}

if (document.querySelectorAll('.popup').length > 0) {
  window.addEventListener("load", function() {
    setTimeout(function() {
      openPopup();
    }, 2000);
  });

  document.querySelector("#close").addEventListener("click", function() {
    closePopup();
  });
}

// Feature 6 : Account.html multiple carousels on a page 
function createCarousel(carouselId) {
  let slideIndex = 0;

  function showSlides() {
    const carousel = document.getElementById(carouselId);
    const slides = carousel.getElementsByClassName("course");
    const totalSlides = slides.length;
    const slidesToShow = 3;

    for (let i = 0; i < totalSlides; i++) {
      slides[i].style.display = "none";
    }

    for (let i = slideIndex; i < slideIndex + slidesToShow; i++) {
      if (i < totalSlides) {
        slides[i].style.display = "block";
      }
    }
  }

  function nextSlide(n) {
    const carousel = document.getElementById(carouselId);
    const slides = carousel.getElementsByClassName("course");
    const totalSlides = slides.length;
    const slidesToShow = 3;

    slideIndex += n;

    if (slideIndex >= totalSlides - slidesToShow + 1) {
      slideIndex = totalSlides - slidesToShow;
    }

    if (slideIndex < 0) {
      slideIndex = 0;
    }

    showSlides();
  }

  document.addEventListener("DOMContentLoaded", () => {
    showSlides();
  });

  return nextSlide;
}

const changeSlide1 = createCarousel('carousel1');
const changeSlide2 = createCarousel('carousel2');

function changeSlide(carouselId, n) {
  if (carouselId === 'carousel1') {
    changeSlide1(n);
  } else if (carouselId === 'carousel2') {
    changeSlide2(n);
  }
}

// Feature 7 : Account.html confirm logout and delete account
function confirmLogout() {
  const userConfirmed = confirm('Are you sure you want to log out?');
  if (userConfirmed) {
    // User clicked "OK"
    alert('You are logged out.');
    // Add your logout logic here
  } else {
    // User clicked "Cancel"
    alert('Logout cancelled.');
  }
}

function confirmDeleteAccount() {
  const userConfirmed = confirm('Are you sure you want to delete your account?');
  if (userConfirmed) {
    // User clicked "OK"
    alert('Your account is deleted.');
    // Add your account deletion logic here
  } else {
    // User clicked "Cancel"
    alert('Account deletion cancelled.');
  }
}
function confirmCancel() {
  const userConfirmed = confirm('Are you sure you want to Cancel?');
  if (userConfirmed) {
    // User clicked "OK"
    alert('Upload cancelled.');
    // Add your logout logic here
  } else {
    // User clicked "Cancel"
    alert('Continue uploading course.');
  }
}