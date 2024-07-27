let currentReviewId = null; // Initialize the current review ID to null

document.addEventListener('DOMContentLoaded', () => {

    // Get course ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseID'); 
    // Log the courseId for debugging purposes
    console.log('Retrieved courseId:', courseId);

    // Fetch reviews & review count if courseId valid
    if (courseId && !isNaN(courseId)) {
        fetchReviews(courseId);
        fetchReviewCountByCourseId(courseId); 
    } else {
        console.error('courseId is not defined or is invalid');
    }    

    // Use session storage to get token + userId
    // Did not choose to get userId from decoding token for security reasons
    const token = sessionStorage.getItem('token'); 
    const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); 

    // Hide "Add Review" button if the user is not logged in
    if (!token) {
        const addReviewBtn = document.getElementById('addReviewBtn');
        if (addReviewBtn) { // Do this instead of straight away set it to none bc this will check if addReviewBtn actually exist. If don't exist & you straight away set display = 0, will ruin the JS execution
            addReviewBtn.style.display = 'none';
        }
    }

    // Add event listeners for navigation titles
    const navTitles = document.querySelectorAll('.nav-title');
    navTitles.forEach(title => { // Adding event listening for each navTitles
        title.addEventListener('click', () => { // When is clicked, 
            const subNav = title.nextElementSibling;
            // When sub-nav not displayed even when clicked, style set to 'block', which makes it visible
            if (subNav.style.display === "none" || subNav.style.display === "") {
                subNav.style.display = "block"; 
            // If sub-nav already displayed, and user clicks, then will hide it the sub-nav 
            } else {
                subNav.style.display = "none";
            }

            //Essentially those ^^ are toggling. Eg at first no sub-nav, you click bc you want see sub-nav. After that you click again to get rid of the sub-nav
        });
    });

     // Add event listeners for review stars
    const reviewStars = document.querySelectorAll('.review .fa-star');
    reviewStars.forEach(star => {
        star.addEventListener('click', () => {
            const value = star.getAttribute('data-value'); // 'data-value' is an attribute mentioned in HTML for the stars 
            const parent = star.closest('.rating');
            const stars = parent.querySelectorAll('.fa-star');

            // For user to deselect all stars (by clicking the 1st star twice so it gets selected & then deselected) <-- means rating = 0
            if (star.classList.contains('selected') && value === '1') {
                stars.forEach(s => s.classList.remove('selected'));

            } else {

                // Below code process is like this:
                // eg 'value' = stars selected eg 3. 
                // so for each stars, if the respective stars' data value is <= 3, then will be selected. (eg stars with data values of 1, 2, 3 will be selected since their data values <= the 'value' aka desired ratings by user)
                // then stars with data-value 4, 5 will not be selected bc it is > value (eg 3 in this case)
                stars.forEach(s => {
                    if (s.getAttribute('data-value') <= value) {
                        s.classList.add('selected');
                    } else {
                        s.classList.remove('selected');
                    }
                });
            }
        });
    });

    // Add event listeners for popup stars
    const popupStars = document.querySelectorAll('.stars-popup .fa-star');
    popupStars.forEach(star => {
        star.addEventListener('click', () => {
            const value = star.getAttribute('data-value');
            if (star.classList.contains('selected') && value === '1') {
                popupStars.forEach(s => s.classList.remove('selected')); // Deselect all stars if the first star is clicked again
            } else {
                popupStars.forEach(s => {
                    if (s.getAttribute('data-value') <= value) {
                        s.classList.add('selected'); // Select stars up to the clicked star
                    } else {
                        s.classList.remove('selected'); // Deselect stars above the clicked star
                    }
                });
            }
        });
    });

    // Add event listener for filter change
    document.getElementById('filter').addEventListener('change', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseID');
        if (courseId && !isNaN(courseId)) {
            fetchReviews(courseId); 
        } else {
            console.error('Invalid course ID');
        }
    });
    
    // Add event listener for sort change
    document.getElementById('sort').addEventListener('change', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseID');
        if (courseId && !isNaN(courseId)) {
            fetchReviews(courseId);
        } else {
            console.error('Invalid course ID');
        }
    });
    
    // Set default sort to be 'Most Recent'
    document.getElementById('sort').value = 'mostRecent';
});

// Function to show the popup for adding or editing a review
function showPopup(type, review = null) {
    const currentUser = { // Define the currentUser object (added this because of Gignite)
        profilePic: sessionStorage.getItem('profilePic') || 'images/profilePic.jpeg'
    };
    const popup = document.getElementById('popup');
    const popupContent = popup.querySelector('.popup-content h2');
    const avatarImg = popup.querySelector('.avatar img'); // Fetch the avatar img element
    popupContent.textContent = type === 'add' ? 'Leave a Review' : 'Edit Review'; // Pop Up title based on Pop Up type
    popup.style.display = 'flex'; // Display popup

    if (type === 'add') {
        avatarImg.src = currentUser.profilePic;  // Set the current user's profile picture (Added for Gignite)
        document.getElementById('review-text').value = ''; // No review text since is 'Add' Pop Up
        document.querySelectorAll('.popup .fa-star').forEach(star => { // Reset star ratings
            star.classList.remove('selected');
        });
        currentReviewId = null; // Clear the current review ID

    } else if (type === 'edit' && review) {
        avatarImg.src = review.querySelector('.author-avatar').src; // Set the avatar image (Added for Gignite)
        document.getElementById('review-text').value = review.querySelector('.review-details p').textContent; // Set review text
        const rating = Array.from(review.querySelectorAll('.fa-star')).filter(star => star.classList.contains('selected')).length;
        document.querySelectorAll('.popup .fa-star').forEach(star => {
            if (star.getAttribute('data-value') <= rating) {
                star.classList.add('selected'); // Select stars up to the current rating
            } else {
                star.classList.remove('selected'); // Deselect stars above the current rating
            }
        });
        currentReviewId = review.getAttribute('data-id'); // Set the current review ID
    }

    // 'Edit' Pop Up type is dealt within 'editReview' function itself
}

// Function to close the popup
function closePopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
}

// Function to delete a review
async function deleteReview(button) {
    const review = button.closest('.review');
    const reviewId = review.getAttribute('data-id');

    try {
        const response = await fetchWithAuth(`reviews/${reviewId}`, {
            method: 'DELETE' // Send a DELETE request
        });

        if (!response) return; 
        if (response.ok) {
            review.remove(); // Remove the review element
            alert('Review deleted successfully!');
        } else {
            const errorMessage = await response.text();
            console.error('Failed to delete review:', errorMessage);
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        alert('Error deleting review');
    }
}

// Function to post a new review or edit an existing review
async function postReview() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = parseInt(urlParams.get('courseID'), 10); // Ensure courseId is an integer
    const reviewText = document.getElementById('review-text').value;
    const rating = document.querySelectorAll('.popup .fa-star.selected').length;

    const endpoint = currentReviewId ? `/reviews/${currentReviewId}` : '/reviews'; // Determine endpoint
    const method = currentReviewId ? 'PUT' : 'POST'; // Determine method based on currentReviewId

    fetchWithAuth('/reviews', { 
        method: method, // POST for new review, PUT for updating existing review
        body: JSON.stringify({ review_text: reviewText, rating: rating, courseId: courseId }) // Send review data
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => { // Data = Response Data incld. review_text, rating etc
        console.log('Review posted successfully:', data); // Debug log
        alert(data.message);
        closePopup();  // Close the popup
        fetchReviews(courseId);  // Refresh the reviews
    })
    .catch(error => {
        console.error('Error posting review:', error);
        alert(`${error.error || 'Internal Server Error'}`);
    });
}

// Function to edit a review
async function editReview(button) {
    const review = button.closest('.review');
    const reviewUserId = parseInt(review.dataset.userId, 10);
    const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); 

    const reviewText = review.querySelector('.review-details p').textContent;
    const reviewStars = review.querySelectorAll('.fa-star');
    const popupStars = document.querySelectorAll('.popup .fa-star');

    // Define avatarImg here (Added this for Gignite)
    const avatarImg = document.querySelector('.popup .avatar img');
    avatarImg.src = review.querySelector('.author-avatar').src; // To be able to use the current comment's profile picture

    document.getElementById('review-text').value = reviewText;

    const rating = Array.from(reviewStars).filter(star => star.classList.contains('selected')).length;

    popupStars.forEach(star => {
        if (star.getAttribute('data-value') <= rating) {
            star.classList.add('selected'); // Select stars up to the current rating
        } else {
            star.classList.remove('selected'); // Deselect stars above the current rating
        }
    });

    showPopup('edit', review); // 'Edit' type for showPopup

    const postButton = document.querySelector('.popup-content .btn.post-btn');
    postButton.onclick = async () => {
        const updatedText = document.getElementById('review-text').value;
        const updatedRating = document.querySelectorAll('.popup .fa-star.selected').length;
        const reviewId = review.getAttribute('data-id');
        const courseId = parseInt(new URLSearchParams(window.location.search).get('courseID'), 10);

        try {
            const response = await fetchWithAuth(`/reviews/${reviewId}`, { 
                method: 'PUT', // Send a PUT request to update the review
                body: JSON.stringify({ review_text: updatedText, rating: updatedRating, courseId: courseId })
            });
            
            if (!response) return;
            if (!response.ok) {
                const error = await response.json();
                throw error;
            }

            const data = await response.json();
            alert(data.message); // Success message
            closePopup(); // Close the popup
            fetchReviews(courseId); // Refresh the reviews
        } catch (error) {
            console.error('Error updating review:', error);
            alert(`${error.error || 'Internal Server Error'}`);
        }
    };

    const cancelButton = document.querySelector('.popup-content .btn.cancel-btn');
    cancelButton.onclick = () => {
        closePopup(); // Close the popup without saving changes
    };
}

async function incrementLikes(reviewId, likeButton, dislikeButton) {
    try {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            alert('User ID is required');
            return;
        }

        const response = await fetchWithAuth(`/reviews/${reviewId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        const data = await response.json();
        if (data.success) {
            likeButton.textContent = `👍 ${data.likes} Likes`;
            alert(data.message);
            if (data.message.includes('removed')) {
                likeButton.setAttribute('data-liked', 'false');
            } else {
                likeButton.setAttribute('data-liked', 'true');
                dislikeButton.setAttribute('data-disliked', 'false');
            }
        } else {
            alert('Error toggling like.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error toggling like.');
    }
}

async function incrementDislikes(reviewId, likeButton, dislikeButton) {
    try {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            alert('User ID is required');
            return;
        }

        const response = await fetchWithAuth(`/reviews/${reviewId}/dislike`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        const data = await response.json();
        if (data.success) {
            dislikeButton.textContent = `👎 ${data.dislikes} Dislikes`;
            alert(data.message);
            if (data.message.includes('removed')) {
                dislikeButton.setAttribute('data-disliked', 'false');
            } else {
                dislikeButton.setAttribute('data-disliked', 'true');
                likeButton.setAttribute('data-liked', 'false');
            }
        } else {
            alert('Error toggling dislike.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error toggling dislike.');
    }
}

// Function to fetch reviews based on course ID
async function fetchReviews(courseId) {

    if (isNaN(courseId)) {
        console.error('Invalid course ID:', courseId); // Log an error if the course ID is invalid
        return;
    }

    const filter = document.getElementById('filter').value;
    const sort = document.getElementById('sort').value;
    const token = sessionStorage.getItem('token'); // Get the token from session storage
    const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); // Get the current user ID from session storage and convert to integer

    let url = `/reviews/course/${courseId}`;
    if (filter !== 'all') {
        url += `/rating/${filter}`; // Add filter to the URL
    }
    if (sort !== 'mostRecent') {
        url += `/sort/${sort}`; // Add sort option to the URL
    }

    try {
        // const response = await fetchWithAuth(url, { 
        const response = await fetch(url, {  // ''fetch' and not 'fetchWithAuth' so that users not logged in can see the reviews
            method: 'GET'  // Send a GET request to fetch reviews
        });
        if (!response.ok) {
            console.error('Failed to fetch reviews:', response.statusText); // Log an error if the request fails
            throw new Error('Failed to fetch reviews');
        }
        const reviews = await response.json();
        console.log('Fetched Reviews:', reviews); // Log fetched reviews
        if (!Array.isArray(reviews)) {
            throw new TypeError('Expected an array of reviews');
        }

        const reviewsContainer = document.getElementById('reviews');
        reviewsContainer.innerHTML = ''; // Clear existing reviews

        reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.classList.add('review');
            reviewElement.setAttribute('data-id', review.review_id);
            reviewElement.setAttribute('data-user-id', review.user_id);
            reviewElement.setAttribute('data-date', review.review_date);

            const likedByUser = review.userLiked ? 'true' : 'false';
            const dislikedByUser = review.userDisliked ? 'true' : 'false';

            const likesText = `👍 ${review.likes || 0} Likes`;
            const dislikesText = `👎 ${review.dislikes || 0} Dislikes`;

            const reviewActions = (token && review.user_id === currentUserId) ? `
                <button onclick="editReview(this)">Edit</button>
                <button class="deleteReview" onclick="deleteReview(this)">Delete</button>
            ` : '';

            const likeDislikeButtons = token ? `
                <button class="like-button" data-liked="${likedByUser}">${likesText}</button>
                <button class="dislike-button" data-disliked="${dislikedByUser}">${dislikesText}</button>
            ` : '';

            reviewElement.innerHTML = `
                <div class="review-content">
                    <div class="review-author">
                        <img src="${review.profilePic || 'images/profilePic.jpeg'}" alt="Author Avatar" class="author-avatar">
                        <div class="review-details">
                            <div class="author-info">
                                <div class="author-name">${review.user_name}</div>
                                <div class="author-role">(${review.role || 'Role not found'})</div>
                            </div>
                            <div class="rating">
                                ${[...Array(5)].map((_, i) => `<i class="fa fa-star ${i < review.rating ? 'selected' : ''}" data-value="${i + 1}"></i>`).join('')}
                            </div>
                            <p>${review.review_text}</p>
                            <p class="review-date">Posted on: ${new Date(review.review_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
                <div class="review-actions">
                    ${likeDislikeButtons}
                    ${reviewActions}
                </div>
            `;

            const likeButton = reviewElement.querySelector('.like-button');
            const dislikeButton = reviewElement.querySelector('.dislike-button');

            likeButton.addEventListener('click', function () {
                if (dislikeButton.getAttribute('data-disliked') === 'true') {
                    alert('You can only like or dislike a review.');
                    return;
                }
                incrementLikes(review.review_id, this, dislikeButton);
            });
    
            dislikeButton.addEventListener('click', function () {
                if (likeButton.getAttribute('data-liked') === 'true') {
                    alert('You can only like or dislike a review.');
                    return;
                }
                incrementDislikes(review.review_id, likeButton, this);
            });
            
            reviewsContainer.appendChild(reviewElement); // Append the review element to the container
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

// Function to fetch the review count by course ID
async function fetchReviewCountByCourseId(courseId) {
    try {
        // const response = await fetchWithAuth(`/reviews/course/${courseId}/count`, { 
        const response = await fetch(`/reviews/course/${courseId}/count`, { 
            method: 'GET' // Send a GET request to fetch review count
        });

        console.log('Response status:', response.status); // Debug
        const responseText = await response.text();
        console.log('Response text:', responseText);

        if (!response.ok) {
            console.error('Error response:', responseText);
            throw new Error('Failed to fetch review count by course ID');
        }

        const data = JSON.parse(responseText);
        console.log('Parsed data:', data); // Debug 

    } catch (error) {
        console.error('Error fetching review count by course ID:', error);
    }
}