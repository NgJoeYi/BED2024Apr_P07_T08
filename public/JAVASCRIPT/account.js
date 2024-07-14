// account.js

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

async function fetchAndDisplayReviews() {
  const token = getToken();
  try {
      const response = await fetch('/reviews', {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch reviews');

      const reviews = await response.json();
      const userId = getUserIdFromToken(token); // Use the new function
      const reviewWrapper = document.querySelector('.review-wrapper');
      reviewWrapper.innerHTML = '';

      const userReviews = reviews.filter(review => review.user_id === userId);

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

// async function deleteReview(reviewId) {
//   console.log('Deleting review with ID:', reviewId); // Log review ID
//   try {
//     const token = getToken();
//     const response = await fetch(`/reviews/${reviewId}`, {
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       }
//     });

//     // Log response status and response
//     console.log('Delete response status:', response.status); // Log response status
//     const result = await response.json();
//     console.log('Delete response result:', result); // Log response result

//     if (!response.ok || result.error) {
//       throw new Error(result.error || 'Failed to delete review');
//     }
    
//     alert('Review deleted successfully');
//     closeDeleteModal();
//     fetchAndDisplayReviews();
//   } catch (error) {
//     console.error('Error deleting review:', error);
//     alert('Error deleting review: ' + error.message);
//   }
// }

async function deleteReview(reviewId) {
  console.log('Deleting review with ID:', reviewId); // Log review ID
  try {
    const token = getToken();
    const response = await fetch(`/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
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

  // Ensure courseId is valid or set to null
  const numericCourseId = courseId !== null && !isNaN(Number(courseId)) ? Number(courseId) : null;
  modal.setAttribute('data-course-id', numericCourseId !== null ? numericCourseId : 'null');

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
  const courseId = modal.getAttribute('data-course-id');

  // Check if newText is valid
  if (!newText) {
      alert('Review text is required.');
      return;
  }

  // Check if newRating is valid
  if (newRating < 1 || newRating > 5) {
      alert('Rating must be between 1 and 5.');
      return;
  }

  try {
      const token = getToken();
      const body = {
          review_text: newText,
          rating: newRating,
          courseId: courseId !== 'null' ? Number(courseId) : 0 // Use 0 as a placeholder for no course
      };

      const response = await fetch(`/reviews/${reviewId}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update review');
      }

      alert('Review updated successfully');
      closeEditReviewModal();
      fetchAndDisplayReviews();
  } catch (error) {
      console.error('Error updating review:', error);
      alert('Error updating review: ' + error.message);
  }
}

document.querySelectorAll('#editReviewModal .stars .fa-star').forEach((star, index) => {
  star.addEventListener('click', () => updateStarSelection(index));
  star.addEventListener('mouseover', () => highlightStars(index));
  star.addEventListener('mouseout', () => resetStars());
});

function updateStarSelection(index) {
  const stars = document.querySelectorAll('#editReviewModal .stars .fa-star');
  stars.forEach((star, i) => {
      if (i <= index) star.classList.add('selected');
      else star.classList.remove('selected');
  });
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

function getToken() {
  return localStorage.getItem('token');
}

function getUserIdFromToken(token) {
  if (!token) {
      throw new Error('No token provided');
  }
  
  const payloadBase64 = token.split('.')[1];
  const decodedPayload = atob(payloadBase64);
  const payload = JSON.parse(decodedPayload);
  
  return payload.id;
}


// accountSetting.js

// Fetch user discussions on DOM load
document.addEventListener('DOMContentLoaded', () => {
  fetchUserDiscussions();
});

async function fetchUserDiscussions() {
  const token = getToken();
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
    const token = getToken();
    const response = await fetch(`/discussions/${discussionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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
    const token = getToken();
    console.log('Deleting discussion with ID:', discussionId, 'for user ID:', token);

    const response = await fetch(`/discussions/${discussionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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

function showSection(sectionId) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => content.classList.remove('active'));

  // Remove active class from all tabs
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => tab.classList.remove('active'));

  // Show the selected tab content
  document.getElementById(sectionId).classList.add('active');

  // Add active class to the clicked tab
  event.target.classList.add('active');
}

// Set the default tab to be active
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('.tab').click();
});


function getToken() {
  // Implementation for fetching the token goes here
  // For example, it could be fetched from local storage
  return localStorage.getItem('token');
}

