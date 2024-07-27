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

document.addEventListener('DOMContentLoaded', function() {
  fetchReviewCountByUserId();
});

async function fetchReviewCountByUserId() {
  const userId = sessionStorage.getItem('userId'); // Assuming userId is stored in session storage
  try {
      const response = await fetchWithAuth(`/reviews/user/${userId}/count`, { 
          method: 'GET'
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
          console.error('Error response:', responseText);
          throw new Error('Failed to fetch review count by user ID');
      }

      const data = JSON.parse(responseText);
      console.log('Parsed data:', data);

      const totalReviewsElement = document.getElementById('total-reviews');
      totalReviewsElement.textContent = data.count;
  } catch (error) {
      console.error('Error fetching review count by user ID:', error);
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


//--------------------------------------------------------------------------------------------------------------------RAEANN - fetching of discussionn-----------------------------------------------------------------------

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Fetch user discussions on DOM load
// Fetch user discussions and other related data when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  fetchUserDiscussions();        // Fetch user discussions from the server
  fetchFollowingCount();         // Fetch the count of users being followed on page load
  fetchFollowerCount();          // Fetch the count of followers on page load
});

// Function to fetch user discussions from the server
async function fetchUserDiscussions() {
  try {
    // Await the result of the fetchWithAuth function which includes JWT authorization headers
    const response = await fetchWithAuth(`/discussions/user`); // ------------------------------------------------- headers in jwtutility.js

    // Check if the response object is falsy
    if (!response) return; // *************** changes for jwt
    // The commented-out code would throw an error if the response is not okay, but it's currently disabled
    // if (!response.ok) {
    //   throw new Error('Failed to fetch user discussions');
    // }

    // Parse the JSON data from the response
    const data = await response.json();
    console.log('Fetched discussions data:', data);

    // Get the element that will display the user discussions
    const discussionsContainer = document.querySelector('.user-discussions');
    // Get the element that displays a message when there are no discussions
    const noDiscussionsMessage = document.querySelector('.no-discussions-message');
    // Get the element that will show the total number of discussions
    const totalDiscussionsElement = document.getElementById('total-discussions'); // Add this line
    
    // Clear any existing content in the discussions container
    discussionsContainer.innerHTML = '';

    // Check if the data indicates success
    if (data.success) {
      // If no discussions are returned, show a no discussions message
      if (data.discussions.length === 0) {
        noDiscussionsMessage.style.display = 'block';
      } else {
        // Hide the no discussions message if there are discussions
        noDiscussionsMessage.style.display = 'none';
        // Iterate over the fetched discussions and add each to the feed
        data.discussions.forEach(discussion => {
          addUserDiscussionToFeed(discussion);
        });
      }
      // Update the total discussions count displayed on the page
      totalDiscussionsElement.textContent = data.discussions.length; // Add this line
    } else {
      // Log the success status and alert the user about the error
      console.log(data.success);
      alert('Error fetching user discussions.');
    }
  } catch (error) {
    // Log any errors encountered during the fetch operation and alert the user
    console.error('Error fetching user discussions:', error);
    alert('Error fetching user discussions: ' + error.message);
  }
}

// --------------------------------------------------------------------------------adding of the fetched discussion in the html..---------------------------------------------

// Function to add a discussion to the user feed
function addUserDiscussionToFeed(discussion) {
  // Select the container where discussions will be added
  const feed = document.querySelector('.user-discussions');
  
  // Create a new div element to represent a post
  const post = document.createElement('div');
  post.classList.add('post'); // Add 'post' class for styling
  post.setAttribute('data-id', discussion.id); // Set a custom data attribute to store the discussion ID

  // Capitalize the first letter of the username
  const capitalizedUsername = capitalizeFirstLetter(discussion.username);

  // Set the inner HTML of the post with the discussion details
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
      <h3>${discussion.title}</h3>
      <p>${discussion.description}</p>
    </div>
    <div class="post-footer">
      <button class="btn delete-btn" data-id="${discussion.id}">Delete</button>
      <button class="btn edit-btn" data-id="${discussion.id}">Edit</button>
    </div>
  `;

  // Append the newly created post element to the feed container
  feed.appendChild(post);

  // Add an event listener to the edit button to open an edit modal with the discussion details
  post.querySelector('.edit-btn').addEventListener('click', () => openEditModal(discussion.id, discussion.title, discussion.description, discussion.category));
  
  // Add an event listener to the delete button to open a delete confirmation modal
  post.querySelector('.delete-btn').addEventListener('click', () => openDeleteDiscussionModal(discussion.id));
}


//-----------------------------------------------------------------------------------------Edit of discussion-----------------------------------------------------------------------

// Function to open the edit modal and populate it with the current discussion details
function openEditModal(discussionId, title, description, category) {
  // Set the values of the input fields in the modal with the existing discussion data
  document.getElementById('editTitle').value = title;
  document.getElementById('editText').value = description;
  document.getElementById('editCategory').value = category;

  // Display the edit modal
  document.getElementById('editModal').style.display = 'block';

  // Attach an event listener to the save button that will trigger the saveEdit function
  document.getElementById('saveEdit').onclick = function () {
    saveEdit(discussionId); // Call saveEdit function with the discussion ID
  };
}

// Function to close the edit modal
function closeEditModal() {
  // Hide the edit modal
  document.getElementById('editModal').style.display = 'none';
}

// Function to save the edited discussion details
async function saveEdit(discussionId) {
  // Retrieve the updated values from the input fields in the modal
  const title = document.getElementById('editTitle').value;
  const description = document.getElementById('editText').value;
  const category = document.getElementById('editCategory').value;

  // Log the data to the console for debugging purposes
  console.log('Saving edit for discussion ID:', discussionId);
  console.log('Title:', title);
  console.log('Description:', description);
  console.log('Category:', category);

  try {
    // Send a PUT request to the server to update the discussion details
    const response = await fetchWithAuth(`/discussions/${discussionId}`, { // ------------------------------------------------- headers in jwtutility.js
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description, category }) // Send updated data in JSON format
    });

    // Parse the JSON response from the server
    const responseData = await response.json();

    // Check if the response was not ok and throw an error if necessary
    if (!response.ok) {
      console.error('Error response from server:', responseData);
      throw new Error('Failed to update discussion');
    }

    // Notify the user that the update was successful
    alert('Discussion updated successfully');
    
    // Refresh the list of discussions to reflect the changes
    fetchUserDiscussions();
    
    // Close the edit modal
    closeEditModal();
  } catch (error) {
    // Log any errors encountered during the update process and alert the user
    console.error('Error updating discussion:', error);
    alert('Error updating discussion: ' + error.message);
  }
}


//--------------------------------------------------------------------------------------------Delete Discussion-------------------------------------------------

// Function to open the delete discussion modal and set up event handlers
function openDeleteDiscussionModal(discussionId) {
  // Log the discussion ID for debugging purposes
  console.log('Opening delete modal for discussion ID:', discussionId);
  
  // Get the delete modal element by its ID
  const deleteModal = document.getElementById('deleteDiscussionModal');
  if (deleteModal) {
    // Display the delete modal
    deleteModal.style.display = 'block';
  } else {
    // Log an error if the delete modal is not found and exit the function
    console.error('Delete modal not found');
    return; // Exit function if modal is not found
  }

  // Get the confirm button element by its ID
  const confirmButton = document.getElementById('confirmDelete');
  if (confirmButton) {
    // Set up an event handler for the confirm button to delete the discussion
    confirmButton.onclick = function () {
      console.log('Confirm delete clicked for discussion ID:', discussionId);
      deleteDiscussion(discussionId); // Call the deleteDiscussion function
    };
  } else {
    // Log an error if the confirm button is not found
    console.error('Confirm button not found');
  }

  // Get the close button element by its ID
  const closeButton = document.getElementById('closeDeleteModal');
  if (closeButton) {
    // Set up an event handler for the close button to close the modal
    closeButton.onclick = closeDeleteModalDis;
  } else {
    // Log an error if the close button is not found
    console.error('Close button not found');
  }

  // Get the cancel button element by its ID
  const cancelButton = document.getElementById('cancelDeleteModal');
  if (cancelButton) {
    // Set up an event handler for the cancel button to close the modal
    cancelButton.onclick = closeDeleteModalDis;
  } else {
    // Log an error if the cancel button is not found
    console.error('Cancel button not found');
  }
}

// Function to close the delete discussion modal
function closeDeleteModalDis() {
  // Log the action for debugging purposes
  console.log('Closing delete modal');
  
  // Get the delete modal element by its ID
  const deleteModal = document.getElementById('deleteDiscussionModal');
  if (deleteModal) { // Check if deleteModal is not null
    // Hide the delete modal
    deleteModal.style.display = 'none';
  } else {
    // Log an error if the delete modal is not found
    console.error('Delete modal not found.');
  }
}

// Function to delete a discussion
async function deleteDiscussion(discussionId) {
  try {
    // Send a DELETE request to the server to delete the discussion
    const response = await fetchWithAuth(`/discussions/${discussionId}`, { // ------------------------------------------------- headers in jwtutility.js
      method: 'DELETE'
    });

    // Check if the response is not okay and throw an error with the response text
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete discussion: ${errorText}`);
    }

    // Notify the user that the discussion was deleted successfully
    alert('Discussion and associated comments deleted successfully');
    // Close the delete modal and refresh the list of discussions
    closeDeleteModalDis(); // Close the modal after deleting
    fetchUserDiscussions();
    
  } catch (error) {
    // Log any errors encountered during the delete operation and alert the user
    console.error('Error deleting discussion:', error);
    alert('Error deleting discussion: ' + error.message);
  }
}


//-----------------------------------------------------------------------------------Fetching of following count------------------------------------------

// Function to fetch and display the count of users the current user is following
async function fetchFollowingCount() {
  try {
    // Make a request to the server to get the following count
    const response = await fetchWithAuth(`/following-count`); // Use your actual endpoint

    // Check if the response is not ok (e.g., HTTP status code is not 200)
    if (!response.ok) {
      // Throw an error if the response indicates a failure
      throw new Error('Failed to fetch following count');
    }

    // Parse the JSON data from the response
    const data = await response.json();
    console.log('Fetched following count:', data); // Log the data for debugging

    // Select the HTML element where the following count will be displayed
    const followingCountElement = document.querySelector('.stat .info h3'); // Ensure this matches your HTML structure
    
    // Update the text content of the selected element with the fetched count
    followingCountElement.textContent = data.count; // Update the count in the HTML
  } catch (error) {
    // Log any errors encountered during the fetch operation
    console.error('Error fetching following count:', error);
    
    // Optionally, you could show an error message to the user or handle the error in other ways
  }
}



// --------------------------------------------------------------------------------fetching the follower count-------------------------------------------------------

// Function to fetch and display the count of followers for the current user
async function fetchFollowerCount() {
  try {
    // Make a request to the server to get the follower count
    const response = await fetchWithAuth(`/follower-count`); // Use your actual endpoint

    // Check if the response is not ok (e.g., HTTP status code is not 200)
    if (!response.ok) {
      // Throw an error if the response indicates a failure
      throw new Error('Failed to fetch follower count');
    }

    // Parse the JSON data from the response
    const data = await response.json();
    console.log('Fetched follower count:', data); // Log the data for debugging

    // Select the HTML element where the follower count will be displayed
    const followerCountElement = document.querySelector('.stat .info h3'); // Ensure this matches your HTML structure

    console.log('followerCountElement:', followerCountElement); // Log the element
    if (followerCountElement) {
      // Update the text content of the selected element with the fetched count
      followerCountElement.textContent = data.count;
    } else {
      // Log an error if the element is not found in the DOM
      console.error('followerCountElement not found in the DOM');
    }
  } catch (error) {
    // Log any errors encountered during the fetch operation
    console.error('Error fetching follower count:', error);
    
    // Optionally, you could show an error message to the user or handle the error in other ways
  }
}


//----------------------------------------------------------------------------END OF RAEANN's DISCUSSION-------------------------------------------------------------------------------------------------------------------------------------------



function showSection(sectionId, event) {
  console.log('showSection called'); // Log function call
  if (!event) {
    event = window.event;
    if (!event) {
      console.error('Event is undefined');
      return;
    }
  }

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
    console.log('First tab found:', firstTab); // Log first tab found
    firstTab.click();
    console.log(`Clicked first tab: ${firstTab.textContent}`); // Debug log
  } else {
    console.error('First tab not found'); // Log if first tab not found
  }
});

