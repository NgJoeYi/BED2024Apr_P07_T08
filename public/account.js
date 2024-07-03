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

// ---------------------------------------------- EDIT AND DELETE REVIEWS ----------------------------------------------

// Fetch and display reviews
async function fetchAndDisplayReviews() {
  const token = sessionStorage.getItem('token'); // Get the logged-in user's ID
  // console.log('User ID:', userId); // Debugging
  try {
    const response = await fetch('/reviews', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    const reviews = await response.json();
    console.log('Fetched Reviews:', reviews); // Debugging
    const reviewWrapper = document.querySelector('.review-wrapper');
    reviewWrapper.innerHTML = ''; // Clear the existing placeholder content

    // Filter reviews to show only those by the logged-in user
    const userReviews = reviews.filter(review => review.user_id == token);
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
      deleteBtn.addEventListener('click', () => openDeleteModal(review.review_id)); // Add event listener
      
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


function openDeleteModal(reviewId) {
  console.log('Opening delete modal for review:', reviewId); // Debugging
  document.getElementById('deleteReviewModal').style.display = 'block';

  // Ensure we set the correct onclick handler each time the modal is opened
  document.getElementById('confirmReviewDelete').onclick = function () {
    deleteReview(reviewId);
  };
}

function closeDeleteModal() {
  console.log('Closing delete modal'); // Debugging
  document.getElementById('deleteReviewModal').style.display = 'none';
}

async function deleteReview(reviewId) {
  try {
    const token = sessionStorage.getItem('token');
    console.log(`Attempting to delete review with ID: ${reviewId}`); // Debugging
    const response = await fetch(`/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ userId: sessionStorage.getItem('token') })
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete review');
    }
    
    const result = await response.json();
    console.log('Server response:', result); // Debugging

    alert('Review deleted successfully');
    closeDeleteModal(); // Close the modal after deletion
    fetchAndDisplayReviews(); // Refresh the reviews
  } catch (error) {
    console.error('Error deleting review:', error);
    alert('Error deleting review: ' + error.message);
  }
}




// Edit review function to open the modal
function editReview(reviewId, currentText, currentRating) {
  openEditReviewModal(reviewId, currentText, currentRating);
}

// Function to open the edit review modal
function openEditReviewModal(reviewId, currentText, currentRating) {
  const modal = document.getElementById('editReviewModal');
  modal.style.display = 'block';

  document.getElementById('editReviewText').value = currentText;

  // Set the selected rating
  const stars = document.querySelectorAll('#editReviewModal .stars .fa-star');
  stars.forEach((star, index) => {
    star.classList.remove('selected');
    if (index < currentRating) {
      star.classList.add('selected');
    }
  });

  // Add event listener to save button
  document.getElementById('submitEditedReview').onclick = function () {
    submitEditedReview(reviewId);
  };
}

// Function to close the edit review modal
function closeEditReviewModal() {
  const modal = document.getElementById('editReviewModal');
  modal.style.display = 'none';
}

// Function to submit the edited review
async function submitEditedReview(reviewId) {
  const newText = document.getElementById('editReviewText').value;
  const newRating = document.querySelectorAll('#editReviewModal .stars .fa-star.selected').length;

  if (newText && newRating >= 1 && newRating <= 5) {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ review_text: newText, rating: newRating, userId: sessionStorage.getItem('token') })
      });
      if (!response.ok) {
        throw new Error('Failed to update review');
      }
      alert('Review updated successfully');
      closeEditReviewModal();
      fetchAndDisplayReviews(); // Refresh the reviews
    } catch (error) {
      console.error('Error updating review:', error);
    }
  } else {
    alert('Invalid input');
  }
}

// Add click event listeners to stars for rating selection in modal
document.querySelectorAll('#editReviewModal .stars .fa-star').forEach((star, index) => {
  star.addEventListener('click', function () {
    const stars = document.querySelectorAll('#editReviewModal .stars .fa-star');
    stars.forEach((s, i) => {
      if (i <= index) {
        s.classList.add('selected');
      } else {
        s.classList.remove('selected');
      }
    });
  });

  star.addEventListener('mouseover', function () {
    const stars = document.querySelectorAll('#editReviewModal .stars .fa-star');
    stars.forEach((s, i) => {
      if (i <= index) {
        s.classList.add('hover');
      } else {
        s.classList.remove('hover');
      }
    });
  });

  star.addEventListener('mouseout', function () {
    const stars = document.querySelectorAll('#editReviewModal .stars .fa-star');
    stars.forEach(s => {
      s.classList.remove('hover');
    });
  });
});



// ----------------------------------------------DISCUSSION--------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  fetchUserDiscussions();
});

async function fetchUserDiscussions() {
  //const token = getCurrentUserId();
  const token = sessionStorage.getItem('token');
  if (!token) {
    console.error('No user token found');
    return;
  }

  try {
    const response = await fetch(`/discussions/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user discussions');
    }

    const data = await response.json();
    console.log('Fetched discussions data:', data); 

    const discussionsContainer = document.querySelector('.user-discussions');
    const noDiscussionsMessage = document.querySelector('.no-discussions-message');
    
    discussionsContainer.innerHTML = '';

    if (data.success) {
      if (data.discussions.length === 0) {
        noDiscussionsMessage.style.display = 'block';
      } else {
        noDiscussionsMessage.style.display = 'none';
        data.discussions.forEach(discussion => {
          addUserDiscussionToFeed(discussion);
        });
      }
    } else {
      console.log(data.success);
      alert('Error fetching user discussions.');
    }
  } catch (error) {
    console.error('Error fetching user discussions:', error); // CHANGED
    alert('Error fetching user discussions: ' + error.message); // CHANGED
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function addUserDiscussionToFeed(discussion) {
  const feed = document.querySelector('.user-discussions');
  const post = document.createElement('div');
  post.classList.add('post');
  post.setAttribute('data-id', discussion.id);

  const capitalizedUsername = capitalizeFirstLetter(discussion.username);

  post.innerHTML = `
    <div class="post-header">
      <div class="profile-pic">
        <img src="${discussion.profilePic || 'images/profilePic.jpeg'}" alt="Profile Picture">
      </div>
      <div class="username">${capitalizedUsername}</div>
    </div>
    <div class="post-meta">
      <span class="category">Category: ${discussion.category}</span>
      <span class="posted-date-activity">Posted on: ${new Date(discussion.posted_date).toLocaleDateString()}</span>
    </div>
    <div class="post-content">
      <p>${discussion.description}</p>
    </div>
    <div class="post-footer">
      <button class="btn delete-btn" data-id="${discussion.id}">Delete</button>
      <button class="btn edit-btn" data-id="${discussion.id}">Edit</button>
    </div>
  `;

  feed.appendChild(post);

  post.querySelector('.edit-btn').addEventListener('click', () => openEditModal(discussion.id, discussion.description, discussion.category));
  post.querySelector('.delete-btn').addEventListener('click', () => openDeleteModal(discussion.id));
}

function getCurrentUserId() {
  return sessionStorage.getItem('token');
}

// Edit Modal functions
function openEditModal(discussionId, description, category) {
  document.getElementById('editText').value = description;
  document.getElementById('editCategory').value = category;
  document.getElementById('editModal').style.display = 'block';

  document.getElementById('saveEdit').onclick = function () {
    saveEdit(discussionId);
  };
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

async function saveEdit(discussionId) {
  const description = document.getElementById('editText').value;
  const category = document.getElementById('editCategory').value;

  try {
    const token = getCurrentUserId();
    const response = await fetch(`/discussions/${discussionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ description, category, userId: token })
    });
    if (!response.ok) {
      throw new Error('Failed to update discussion');
    }
    alert('Discussion updated successfully');
    fetchUserDiscussions();
    closeEditModal();
  } catch (error) {
    console.error('Error updating discussion:', error);
  }
}

function openDeleteModal(discussionId) {
  console.log('Opening delete modal for discussion ID:', discussionId);
  document.getElementById('deleteDiscussionModal').style.display = 'block';

  // Attach the onclick event to the confirm delete button
  const confirmButton = document.getElementById('confirmDelete');
  confirmButton.onclick = function () {
    console.log('Confirm delete clicked for discussion ID:', discussionId);
    deleteDiscussion(discussionId);
  };

  // Attach the onclick event to the close and cancel buttons
  const closeButton = document.getElementById('closeDeleteModal');
  const cancelButton = document.getElementById('cancelDeleteModal');
  closeButton.onclick = closeDeleteModal;
  cancelButton.onclick = closeDeleteModal;
}

function closeDeleteModal() {
  console.log('Closing delete modal');
  document.getElementById('deleteDiscussionModal').style.display = 'none';
}

async function deleteDiscussion(discussionId) {
  try {
    const token = getCurrentUserId();
    console.log('Deleting discussion with ID:', discussionId, 'for user ID:', token);

    const response = await fetch(`/discussions/${discussionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token: token })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete discussion: ${errorText}`);
    }

    alert('Discussion and associated comments deleted successfully');
    fetchUserDiscussions();
    closeDeleteModal(); // Ensure the modal is closed first
     // Fetch user discussions after closing the modal
  } catch (error) {
    console.error('Error deleting discussion:', error);
    alert('Error deleting discussion: ' + error.message);
  }
}