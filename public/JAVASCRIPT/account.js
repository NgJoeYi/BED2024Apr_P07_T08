// Toggle dropdown
function toggleDropdown() {
  const dropdown = document.querySelector('.dropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

window.onclick = function(event) {
  if (!event.target.matches('.user-info') && !event.target.matches('.user-info *')) {
    const dropdown = document.querySelector('.dropdown');
    if (dropdown.style.display === 'block') {
      dropdown.style.display = 'none';
    }
  }
};

// --------------------------------------reviews-----------------------------
document.addEventListener('DOMContentLoaded', function() {
  fetchAndDisplayReviews();
});

async function isValidCourseId(courseId) {
  console.log('Validating Course ID:', courseId); // Log the course ID being validated

  try {
    const response = await fetchWithAuth(`/courses/${courseId}`, { // ------------------------------------------------- headers in jwtutility.js
      method: 'GET'
    });

    const responseData = await response.json();
    console.log('Validation Response Data:', responseData); // Log the validation response data

    return response.ok;
  } catch (error) {
    console.error('Error validating course ID:', error);
    return false;
  }
}

async function fetchAndDisplayReviews() {
  try {
    const response = await fetchWithAuth('/reviews'); // ------------------------------------------------- headers in jwtutility.js
    // if (!response.ok) throw new Error('Failed to fetch reviews');
    if (!response) return; // *************** changes for jwt

    const reviews = await response.json();
    const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); // Get the current user ID from session storage and convert to integer
    console.log('Current User ID:', currentUserId); // Debug log
    console.log('Fetched Reviews:', reviews); // Debug log

    const reviewWrapper = document.querySelector('.review-wrapper');
    reviewWrapper.innerHTML = '';

    const userReviews = reviews.filter(review => review.user_id === currentUserId);
    console.log('Filtered User Reviews:', userReviews); // Debug log

    if (userReviews.length === 0) {
      reviewWrapper.innerHTML = '<p>No reviews found for this user.</p>';
      return;
    }

    userReviews.forEach(review => {
      console.log('Review Object:', review); // Debug log
      createReviewCard(review, reviewWrapper);
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
  }
}

async function fetchReviewCount() {
  try {
    // Adjust the endpoint as necessary
    const response = await fetch('/reviews/count', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}` // Include authorization if needed
      }
    });

    console.log('Response status:', response.status); // Add this line
    const responseText = await response.text(); // Log the response text
    console.log('Response text:', responseText); // Add this line to log the response text

    if (!response.ok) {
      console.error('Error response:', responseText); // Log the error response text
      throw new Error('Failed to fetch review count');
    }

    const data = JSON.parse(responseText); // Parse the response text as JSON
    console.log('Parsed data:', data); // Log the parsed data

    const totalReviewsElement = document.getElementById('total-reviews');
    totalReviewsElement.textContent = data.count;
  } catch (error) {
    console.error('Error fetching review count:', error);
  }
}

// Call the function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
  fetchReviewCount();
});

function createReviewCard(review, reviewWrapper) {
  const reviewCard = document.createElement('div');
  reviewCard.className = 'review-card';
  reviewCard.setAttribute('data-review-id', review.review_id);

  const reviewHeader = document.createElement('div');
  reviewHeader.className = 'review-header';

  const profilePic = document.createElement('img');
  profilePic.src = review.profilePic;
  profilePic.alt = 'profile image';
  profilePic.className = 'profile-pic';

  const reviewInfo = document.createElement('div');
  reviewInfo.className = 'review-info';

  const userName = document.createElement('span');
  userName.className = 'user-name';
  userName.textContent = review.user_name;

  const stars = createStars(review.rating);

  const reviewDate = document.createElement('div');
  reviewDate.className = 'review-date';
  reviewDate.textContent = new Date(review.review_date).toLocaleDateString();

  const reviewContent = document.createElement('div');
  reviewContent.className = 'review-content';

  const reviewText = document.createElement('p');
  reviewText.textContent = review.review_text;

  const reviewActions = document.createElement('div');
  reviewActions.className = 'review-actions';

  // Handle optional courseId
  const courseId = review.courseId !== undefined ? review.courseId : null;

  const editBtn = createButton('Edit', () => editReview(review.review_id, review.review_text, review.rating, courseId));
  reviewActions.appendChild(editBtn);

  const deleteBtn = createButton('Delete', () => openDeleteReviewModal(review.review_id));
  reviewActions.appendChild(deleteBtn);

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
}

function createStars(rating) {
  const stars = document.createElement('div');
  stars.className = 'stars';
  for (let i = 0; i < rating; i++) {
    const star = document.createElement('i');
    star.className = 'fa-solid fa-star';
    star.style.color = '#FFD43B';
    stars.appendChild(star);
  }
  for (let i = rating; i < 5; i++) {
    const star = document.createElement('i');
    star.className = 'fa-solid fa-star';
    star.style.color = '#ccc';
    stars.appendChild(star);
  }
  return stars;
}

function createButton(text, onClick) {
  const button = document.createElement('button');
  button.className = 'btn';
  button.textContent = text;
  button.addEventListener('click', onClick);
  return button;
}

function openDeleteReviewModal(reviewId) {
  const deleteReviewModal = document.getElementById('deleteReviewModal');
  deleteReviewModal.style.display = 'block';
  deleteReviewModal.setAttribute('data-review-id', reviewId);
}

function closeDeleteReviewModal() {
  const deleteReviewModal = document.getElementById('deleteReviewModal');
  if (deleteReviewModal) {
    deleteReviewModal.style.display = 'none';
    deleteReviewModal.removeAttribute('data-review-id');
  } else {
    console.error('Delete review modal element not found.');
  }
}

document.getElementById('confirmReviewDelete').addEventListener('click', function() {
  const deleteReviewModal = document.getElementById('deleteReviewModal');
  const reviewId = deleteReviewModal.getAttribute('data-review-id');
  if (reviewId) {
    deleteReview(reviewId);
  } else {
    console.error('Review ID not found.');
  }
});

async function deleteReview(reviewId) {
  console.log('Deleting review with ID:', reviewId); // Log review ID
  try {
    const response = await fetchWithAuth(`/reviews/${reviewId}`, { // ------------------------------------------------- headers in jwtutility.js
      method: 'DELETE'
    });

    // Log response status and response
    console.log('Delete response status:', response.status); // Log response status
    const result = await response.json();
    console.log('Delete response result:', result); // Log response result

    if (!response.ok || result.error) {
      throw new Error(result.error || 'Failed to delete review');
    }

    alert('Review deleted successfully');
    closeDeleteReviewModal();

    // Remove the deleted review element from the DOM
    const reviewElement = document.querySelector(`.review-card[data-review-id="${reviewId}"]`);
    if (reviewElement) {
      reviewElement.remove();
    }

  } catch (error) {
    console.error('Error deleting review:', error);
    alert('Error deleting review: ' + error.message);
  }
}

function editReview(reviewId, currentText, currentRating, courseId) {
  openEditReviewModal(reviewId, currentText, currentRating, courseId);
}

function openEditReviewModal(reviewId, currentText, currentRating, courseId) {
  const modal = document.getElementById('editReviewModal');
  modal.style.display = 'block';
  document.getElementById('editReviewText').value = currentText;
  setRatingStars(currentRating);

  // Ensure courseId is valid or set to 1 (default valid course ID)
  const numericCourseId = courseId !== null && !isNaN(Number(courseId)) ? Number(courseId) : 1;
  modal.setAttribute('data-course-id', numericCourseId !== null ? numericCourseId : 'null');

  console.log('Opening Edit Modal:');
  console.log('Review ID:', reviewId);
  console.log('Current Text:', currentText);
  console.log('Current Rating:', currentRating);
  console.log('Course ID:', numericCourseId);

  document.getElementById('submitEditedReview').onclick = function () {
    submitEditedReview(reviewId);
  };
}

function closeEditReviewModal() {
  document.getElementById('editReviewModal').style.display = 'none';
}

function setRatingStars(rating) {
  const stars = document.querySelectorAll('#editReviewModal .stars .fa-star');
  stars.forEach((star, index) => {
    star.classList.remove('selected');
    if (index < rating) star.classList.add('selected');
  });
}

async function submitEditedReview(reviewId) {
  const newText = document.getElementById('editReviewText').value;
  const newRating = document.querySelectorAll('#editReviewModal .stars .fa-star.selected').length;
  const modal = document.getElementById('editReviewModal');
  const courseIdAttr = modal.getAttribute('data-course-id');
  const courseId = courseIdAttr !== 'null' ? Number(courseIdAttr) : 1; // Default to a valid course ID (1)

  console.log('Submitting edited review:');
  console.log('Review ID:', reviewId);
  console.log('New Text:', newText);
  console.log('New Rating:', newRating);
  console.log('Course ID:', courseId);

  try {
    const body = {
      review_text: newText,
      rating: newRating,
      courseId: courseId // Always include courseId
    };

    console.log('Request Body:', body); // Log the request body

    const response = await fetchWithAuth(`/reviews/${reviewId}`, { // ------------------------------------------------- headers in jwtutility.js
      method: 'PUT',
      body: JSON.stringify(body)
    });

    const responseData = await response.json();
    console.log('Response Data:', responseData); // Log the response data

    if (!response.ok) {
      console.error('Error response from server:', responseData);
      alert(responseData.error); // Show JOI validation error as alert
    } else {
      alert('Review updated successfully');
      closeEditReviewModal();
      fetchAndDisplayReviews();
    }
  } catch (error) {
    console.error('Error updating review:', error);
    alert('Error updating review: ' + error.message); // Show generic error message
  }
}

document.querySelectorAll('#editReviewModal .stars .fa-star').forEach((star, index) => {
  star.addEventListener('click', () => updateStarSelection(index));
  star.addEventListener('mouseover', () => highlightStars(index));
  star.addEventListener('mouseout', () => resetStars());
});

// function updateStarSelection(index) {
//   const stars = document.querySelectorAll('#editReviewModal .stars .fa-star');
//   if (index === 0) {
//     // If the first star is clicked, set rating to 0 and remove all selected stars
//     stars.forEach(star => star.classList.remove('selected'));
//   } else {
//     stars.forEach((star, i) => {
//       if (i <= index) star.classList.add('selected');
//       else star.classList.remove('selected');
//     });
//   }
// }

function updateStarSelection(index) {
  const stars = document.querySelectorAll('#editReviewModal .stars .fa-star');
  const firstStarSelected = stars[0].classList.contains('selected');

  if (index === 0) {
    // If the first star is clicked and it is already selected, deselect it
    if (firstStarSelected) {
      stars.forEach(star => star.classList.remove('selected'));
    } else {
      // Select only the first star
      stars.forEach((star, i) => {
        if (i === 0) star.classList.add('selected');
        else star.classList.remove('selected');
      });
    }
  } else {
    // For other stars, update the selection as usual
    stars.forEach((star, i) => {
      if (i <= index) star.classList.add('selected');
      else star.classList.remove('selected');
    });
  }
}

function highlightStars(index) {
  const stars = document.querySelectorAll('#editReviewModal .stars .fa-star');
  stars.forEach((star, i) => {
    if (i <= index) star.classList.add('hover');
    else star.classList.remove('hover');
  });
}

function resetStars() {
  const stars = document.querySelectorAll('#editReviewModal .stars .fa-star');
  stars.forEach(star => star.classList.remove('hover'));
}

// Fetch user discussions on DOM load
document.addEventListener('DOMContentLoaded', () => {
  fetchUserDiscussions();
});

async function fetchUserDiscussions() {
  try {
    const response = await fetchWithAuth(`/discussions/user`); // ------------------------------------------------- headers in jwtutility.js
    if (!response) return; // *************** changes for jwt
    // if (!response.ok) {
    //   throw new Error('Failed to fetch user discussions');
    // }

    const data = await response.json();
    console.log('Fetched discussions data:', data);

    const discussionsContainer = document.querySelector('.user-discussions');
    const noDiscussionsMessage = document.querySelector('.no-discussions-message');
    const totalDiscussionsElement = document.getElementById('total-discussions'); // Add this line
    
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
      // Update the total discussions count
      totalDiscussionsElement.textContent = data.discussions.length; // Add this line
    } else {
      console.log(data.success);
      alert('Error fetching user discussions.');
    }
  } catch (error) {
    console.error('Error fetching user discussions:', error);
    alert('Error fetching user discussions: ' + error.message);
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
    <span class="posted-date-activity">${new Date(discussion.posted_date).toLocaleDateString()}</span>
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
  post.querySelector('.delete-btn').addEventListener('click', () => openDeleteDiscussionModal(discussion.id));
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

  console.log('Saving edit for discussion ID:', discussionId);
  console.log('Description:', description);
  console.log('Category:', category);

  try {
    const response = await fetchWithAuth(`/discussions/${discussionId}`, { // ------------------------------------------------- headers in jwtutility.js
      method: 'PUT',
      body: JSON.stringify({ description, category })
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Error response from server:', responseData);
      throw new Error('Failed to update discussion');
    }

    alert('Discussion updated successfully');
    fetchUserDiscussions();
    closeEditModal();
  } catch (error) {
    console.error('Error updating discussion:', error);
    alert('Error updating discussion: ' + error.message);
  }
}

// Delete Modal functions
function openDeleteDiscussionModal(discussionId) {
  console.log('Opening delete modal for discussion ID:', discussionId);
  const deleteModal = document.getElementById('deleteDiscussionModal');
  if (deleteModal) {
    deleteModal.style.display = 'block';
  } else {
    console.error('Delete modal not found');
    return; // Exit function if modal is not found
  }

  const confirmButton = document.getElementById('confirmDelete');
  if (confirmButton) {
    confirmButton.onclick = function () {
      console.log('Confirm delete clicked for discussion ID:', discussionId);
      deleteDiscussion(discussionId);
    };
  } else {
    console.error('Confirm button not found');
  }

  const closeButton = document.getElementById('closeDeleteModal');
  if (closeButton) {
    closeButton.onclick = closeDeleteModal;
  } else {
    console.error('Close button not found');
  }

  const cancelButton = document.getElementById('cancelDeleteModal');
  if (cancelButton) {
    cancelButton.onclick = closeDeleteModal;
  } else {
    console.error('Cancel button not found');
  }
}

function closeDeleteModalDis() {
  console.log('Closing delete modal');
  const deleteModal = document.getElementById('deleteDiscussionModal');
  if (deleteModal) {  // Check if deleteModal is not null
    deleteModal.style.display = 'none';
  } else {
    console.error('Delete modal not found.');
  }
}

async function deleteDiscussion(discussionId) {
  try {
    const response = await fetchWithAuth(`/discussions/${discussionId}`, { // ------------------------------------------------- headers in jwtutility.js
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete discussion: ${errorText}`);
    }

    alert('Discussion and associated comments deleted successfully');
    closeDeleteModalDis(); // Close the modal after deleting
    fetchUserDiscussions();
    
  } catch (error) {
    console.error('Error deleting discussion:', error);
    alert('Error deleting discussion: ' + error.message);
  }
}


function showSection(sectionId, event) {
  console.log(`Showing section: ${sectionId}`); // Debug log

  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => {
    content.classList.remove('active');
    console.log(`Removed active class from content: ${content.id}`); // Debug log
  });

  // Remove active class from all tabs
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.classList.remove('active');
    console.log(`Removed active class from tab: ${tab.textContent}`); // Debug log
  });

  // Show the selected tab content
  const activeContent = document.getElementById(sectionId);
  activeContent.classList.add('active');
  console.log(`Added active class to content: ${sectionId}`); // Debug log

  // Add active class to the clicked tab
  event.target.classList.add('active');
  console.log(`Added active class to tab: ${event.target.textContent}`); // Debug log
}

// Set the default tab to be active
document.addEventListener('DOMContentLoaded', function() {
  const firstTab = document.querySelector('.tab');
  if (firstTab) {
    firstTab.click();
    console.log(`Clicked first tab: ${firstTab.textContent}`); // Debug log
  }
});