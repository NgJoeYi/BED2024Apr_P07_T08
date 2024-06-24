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
// document.getElementById('edit-icon').addEventListener('click', function() {
//   const editAccountDetails = document.getElementById('edit-account-details');
//   editAccountDetails.style.display = editAccountDetails.style.display === 'none' || editAccountDetails.style.display === '' ? 'block' : 'none';
// });

// document.getElementById('save-changes').addEventListener('click', function() {
//   const newUsername = document.getElementById('edit-name').value;
//   const newBirthDate = document.getElementById('edit-birth-date').value;
//   const newEmail = document.getElementById('edit-email').value;
  
//   // Update the profile info
//   document.querySelector('.profile-info .user-name').textContent = newUsername;

//   // Update all elements with the class 'user-name' in reviews and comments
//   document.querySelectorAll('.review-info .user-name, .comment-user-info .user-name').forEach(element => {
//     element.textContent = newUsername;
//   });

//   // Hide the edit section
//   document.getElementById('edit-account-details').style.display = 'none';
// });


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


// --------------- edit and delete account 

// populate data to make it a prefilled form and ready to be editted but does not update in db yet
document.addEventListener('DOMContentLoaded', async function () {
  const userId = sessionStorage.getItem('userId');
  
  if (userId) {
    try {
      const response = await fetch(`/account/${userId}`);
      
      if (response.ok) {
        const user = await response.json();
        
        // Populate profile info
        document.querySelector('.profile-info .user-name').textContent = user.name;
        
        // Prefill edit form fields
        document.getElementById('edit-name').value = user.name;
        document.getElementById('edit-birth-date').value = user.dob.split('T')[0];
        document.getElementById('edit-email').value = user.email;
        
        // Update other elements with the user's name
        document.querySelectorAll('.review-info .user-name, .comment-user-info .user-name').forEach(element => {
          element.textContent = user.name;
        });

      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  } else {
    console.error('No user is logged in');
  }
  
  // Toggle visibility for edit account details
  document.getElementById('edit-icon').addEventListener('click', function () {
    const editAccountDetails = document.getElementById('edit-account-details');
    if (editAccountDetails.style.display === 'block') {
      editAccountDetails.style.display = 'none';
    } else {
      editAccountDetails.style.display = 'block';
    }
  });

  // Handle form submission
  document.getElementById('save-changes').addEventListener('click', async function (event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('edit-password').value;
    const confirmPassword = document.getElementById('edit-confirm-password').value;
    
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    const updatedUserData = {
      name: document.getElementById('edit-name').value,
      dob: document.getElementById('edit-birth-date').value,
      email: document.getElementById('edit-email').value,
      currentPassword: currentPassword,
      newPassword: newPassword
    };
    
    try {
      const response = await fetch(`/account/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUserData)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        alert('User details updated successfully');
        
        // Update displayed user info
        document.querySelector('.profile-info .user-name').textContent = updatedUser.name;
        document.querySelectorAll('.review-info .user-name, .comment-user-info .user-name').forEach(element => {
          element.textContent = updatedUser.name;
        });

        // Close the edit fields
        document.getElementById('edit-account-details').style.display = 'none';
        
      } else {
        const errorData = await response.json();
        alert(`Error updating user details: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

// Fetch and display reviews
async function fetchAndDisplayReviews() {
  const userId = sessionStorage.getItem('userId'); // Get the logged-in user's ID
  console.log('User ID:', userId); // Debugging
  try {
    const response = await fetch('/reviews');
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    const reviews = await response.json();
    console.log('Fetched Reviews:', reviews); // Debugging
    const reviewWrapper = document.querySelector('.review-wrapper');
    reviewWrapper.innerHTML = ''; // Clear the existing placeholder content

    // Filter reviews to show only those by the logged-in user
    const userReviews = reviews.filter(review => review.user_id == userId);
    console.log('Filtered Reviews:', userReviews); // Debugging

    if (userReviews.length === 0) {
      reviewWrapper.innerHTML = '<p>No reviews found for this user.</p>'; // Inform user
    }

    userReviews.forEach(review => {
      const reviewCard = document.createElement('div');
      reviewCard.className = 'review-card';
      reviewCard.setAttribute('data-review-id', review.review_id); // Add data attribute for review ID

      const reviewHeader = document.createElement('div');
      reviewHeader.className = 'review-header';

      const profilePic = document.createElement('img');
      profilePic.src = 'images/profilePic.jpeg';
      profilePic.alt = 'profile image';
      profilePic.className = 'profile-pic';

      const reviewInfo = document.createElement('div');
      reviewInfo.className = 'review-info';

      const userName = document.createElement('span');
      userName.className = 'user-name';
      userName.textContent = review.user_name;

      const stars = document.createElement('div');
      stars.className = 'stars';
      for (let i = 0; i < review.rating; i++) {
        const star = document.createElement('i');
        star.className = 'fa-solid fa-star';
        star.style.color = '#FFD43B';
        stars.appendChild(star);
      }
      for (let i = review.rating; i < 5; i++) {
        const star = document.createElement('i');
        star.className = 'fa-solid fa-star';
        star.style.color = '#ccc';
        stars.appendChild(star);
      }

      const reviewDate = document.createElement('div');
      reviewDate.className = 'review-date';
      reviewDate.textContent = new Date(review.review_date).toLocaleDateString();

      const reviewContent = document.createElement('div');
      reviewContent.className = 'review-content';

      const reviewText = document.createElement('p');
      reviewText.textContent = review.review_text;

      const reviewActions = document.createElement('div');
      reviewActions.className = 'review-actions';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => deleteReview(review.review_id)); // Add event listener

      const editBtn = document.createElement('button');
      editBtn.className = 'btn edit-btn';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => editReview(review.review_id, review.review_text, review.rating)); // Add event listener

      reviewActions.appendChild(deleteBtn);
      reviewActions.appendChild(editBtn);

      reviewInfo.appendChild(userName);
      reviewInfo.appendChild(stars);

      reviewHeader.appendChild(profilePic);
      reviewHeader.appendChild(reviewInfo);
      reviewHeader.appendChild(reviewDate);

      reviewContent.appendChild(reviewText);

      reviewCard.appendChild(reviewHeader);
      reviewCard.appendChild(reviewContent);
      reviewCard.appendChild(reviewActions);

      reviewWrapper.appendChild(reviewCard);
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
  }
}

// Call the function to fetch and display reviews
fetchAndDisplayReviews();

// Delete review function
async function deleteReview(reviewId) {
  try {
    const response = await fetch(`/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: sessionStorage.getItem('userId') })
    });
    if (!response.ok) {
      throw new Error('Failed to delete review');
    }
    alert('Review deleted successfully');
    fetchAndDisplayReviews(); // Refresh the reviews
  } catch (error) {
    console.error('Error deleting review:', error);
  }
}

// Edit review function
function editReview(reviewId, currentText, currentRating) {
  const newText = prompt('Enter new review text:', currentText);
  const newRating = parseInt(prompt('Enter new rating (1-5):', currentRating), 10);
  if (newText && newRating >= 1 && newRating <= 5) {
    updateReview(reviewId, newText, newRating);
  } else {
    alert('Invalid input');
  }
}

async function updateReview(reviewId, reviewText, rating) {
  try {
    const response = await fetch(`/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ review_text: reviewText, rating: rating, userId: sessionStorage.getItem('userId') })
    });
    if (!response.ok) {
      throw new Error('Failed to update review');
    }
    alert('Review updated successfully');
    fetchAndDisplayReviews(); // Refresh the reviews
  } catch (error) {
    console.error('Error updating review:', error);
  }
}
