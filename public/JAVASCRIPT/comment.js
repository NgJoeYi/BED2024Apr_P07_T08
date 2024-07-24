document.addEventListener('DOMContentLoaded', () => {

    // Fetch elements
    const popup = document.getElementById('popup');  // Get the popup element
    const addCommentBtn = document.getElementById('addCommentBtn'); // Get the "Add Comment" button element

    // Flag to determine if the popup is in edit mode
    let editMode = false; 
    // To store the current comment being edited
    let currentComment = null;
    // To store the ID of the current comment being edited
    let currentCommentId = null;

    const token = getToken(); // Retrieve authentication token
    const currentUserId = parseInt(sessionStorage.getItem('userId'), 10);  // Get the current user ID from session storage and not decode token bc decode token to get user Id pose security concerns since sensitive info can be found using token
    const currentUser = { // Define the currentUser object with profile picture (added this because of Gignite)
        profilePic: sessionStorage.getItem('profilePic') || 'images/profilePic.jpeg'
    };

    // Event listener to show the popup for adding a comment if token exists
    if (token) {
        addCommentBtn.addEventListener('click', () => {
            showPopup('add'); 
        });
    } else {
        addCommentBtn.style.display = 'none';  // Hide the "Add Comment" button if no token is present
    }

    // Pop up is for Add Comment and for Edit Comment, so need 'type' to differentiate them
    function showPopup(type) {
        const popupTitle = popup.querySelector('h2');
        const commentText = document.getElementById('comment-text');
        const saveButton = popup.querySelector('button');
        const cancelButton = popup.querySelector('.cancel-btn'); // Added this for Gignite
        const avatarImg = popup.querySelector('.avatar img'); // Fetch the avatar img element (Added this for Gignite)

        if (type === 'add') { // If the type is 'add', set up for adding a new comment
            popupTitle.textContent = 'Leave a Comment';
            commentText.value = ''; // Clear the comment text input
            avatarImg.src = currentUser.profilePic;  // Set the current user's profile picture
            editMode = false; // Set edit mode to false
            currentComment = null; // Clear the current comment 
            currentCommentId = null; // Clear the current comment ID
            saveButton.onclick = saveComment; // Set save button click handler to saveComment

        } else {  // If the type is 'edit', set up for editing an existing comment
            popupTitle.textContent = 'Edit Comment';
            commentText.value = currentComment.querySelector('.comment-content').textContent.trim(); // Set the comment text input to the current comment's content
            avatarImg.src = currentComment.querySelector('.avatar img').src; // Use the current comment's profile picture (default or own pfp etc)
            editMode = true; // Set edit mode to true
            saveButton.onclick = saveComment;  
        }

        cancelButton.onclick = closePopup; // Set cancel button click handler to closePopup (Added for Gignite)
        popup.style.display = 'flex';
    }

    // Function to hide the popup
    function closePopup() {
        popup.style.display = 'none';
    }

    // Function to save a comment, either by adding a new comment or updating an existing one
    async function saveComment() {
        const commentText = document.getElementById('comment-text').value; // Get comment text
        const discussionId = new URLSearchParams(window.location.search).get('discussionId'); // Get discussion ID from URL
    
        try {
            
            // 'editMode && currentComment' is a condition and used with '? :' ---> if true (editMode = true, currentComment not null), will go to ? branch (PUT). if false (editMode = false), will go : branch (POST)
            const response = editMode && currentComment

                // 'fetchWithAuth' is in JwtUtility.js, which is used to verify token in frontend. 'verifyJWT' middleware in your routes is to verify token in backend
                ? await fetchWithAuth(`/comments/${currentCommentId}`, { 
                    method: 'PUT',
                    body: JSON.stringify({ content: commentText, discussionId: parseInt(discussionId, 10) })
                })
                : await fetchWithAuth('/comments', { 
                    method: 'POST',
                    body: JSON.stringify({ content: commentText, discussionId: parseInt(discussionId, 10) })
                });
    
            if (response.ok) { // See if the PUT and POST is done successfully
                if (editMode && currentComment) {
                    currentComment.querySelector('.comment-content').textContent = commentText;
                    alert('Comment updated successfully!');
                } else {
                    alert('Comment posted successfully!');
                    fetchComments(discussionId); // Refresh the comments to display new comment
                }
                closePopup();
            } else {
                const errorData = await response.json();
                alert(errorData.error || response.statusText); // Show alert for error
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    // Function to post a new comment
    async function postComment(text, discussionId) {
        try {
            const response = await fetchWithAuth('/comments', { 
                method: 'POST',
                body: JSON.stringify({ content: text, discussionId: parseInt(discussionId, 10) }) // Ensure discussionId is an integer
            });
            if (response.ok) { 
                alert('Comment posted successfully!');
                fetchComments(discussionId); // Refresh the comments to display new comment 
            } else {
                const errorData = await response.json(); // Get error data from the response
                alert(errorData.error || response.statusText); // Show alert for error
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
        
    // Function to delete a comment
    async function deleteComment(button) {
        const comment = button.closest('.comment'); // Get the closest comment element
        const commentId = comment.dataset.id;
    
        try {
            const response = await fetchWithAuth(`/comments/${commentId}`, {
                method: 'DELETE'
            });
    
            console.log('Response status:', response.status);  // Log response status

            if (response.ok){
                if (confirm("Are you sure you want to delete this comment?")) {
                    comment.remove(); // Remove the comment from the DOM
                    alert('Comment deleted successfully!');
                }
            }
            else{
                console.error('Failed to delete comment:', response.statusText); // Log error to the console
            }
    
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
     // Function to edit a comment
    async function editComment(button) {

        // 'button.closest' is to ensure I edit the right comment that I want to edit ---> I can have 2 diff comments, but the edit button for both comments are named the same. So need use button.closest to ensure I am editing my desired comment and not my other comment. (button.closest = will take the nearest comment where you clicked the button)
        const comment = button.closest('.comment');
        const commentUserId = parseInt(comment.dataset.userId, 10); // Get the user ID from the comment's data attribute
        const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); // Get the current user ID from session storage
        
        if (commentUserId === currentUserId) {
            currentComment = comment; // currentComment = the comment I want edit
            currentCommentId = comment.dataset.id;
            showPopup('edit'); // Pop up for type 'Edit' is shown
        } else {
            alert('You can only edit your own comments.');
        }
    }
        
    async function fetchDiscussionDetails(discussionId) {
        try {
            const response = await fetchWithAuth(`/discussions/${discussionId}`);
            if (!response.ok) {
                throw new Error(`Error fetching discussion: ${response.statusText}`); // Throw error if response is not OK
            }
            const discussion = await response.json();  // Get discussion data from response
            if (!discussion) {
                throw new Error('Discussion not found');
            }
            displayDiscussionDetails(discussion); // Display the discussion details
        } catch (error) {
            console.error('Error fetching discussion details:', error);
        }
    }

    // Function to display discussion details
    function displayDiscussionDetails(discussion) {
        if (!discussion) {
            console.error('No discussion details to display'); // Log error if no discussion data
            return;
        }
    
        const mainPost = document.getElementById('main-post');  // Get the main post element
        if (!mainPost) {
            console.error('main-post element not found');
            return;
        }
    
        const capitalizedUsername = capitalizeFirstLetter(discussion.username);
        const likedByUser = discussion.userLiked; // should be a boolean
        const dislikedByUser = discussion.userDisliked; // should be a boolean
    
        const likesText = `👍 ${discussion.likes} Likes`;
        const dislikesText = `👎 ${discussion.dislikes} Dislikes`;
    
        // Set the inner HTML of the main post element with discussion details
        mainPost.innerHTML = `
            <div class="post-header">
                <div class="profile-pic">
                    <img src="${discussion.profilePic || 'images/profilePic.jpeg'}" alt="Profile Picture">
                </div>
                <div class="username">${capitalizedUsername}</div>
            </div>
            <div class="post-meta">
                <span class="category-discussion">Category: ${discussion.category}</span>
                <span class="posted-date-activity-dis">Posted on: ${new Date(discussion.posted_date).toLocaleDateString()}</span>
            </div>
            <div class="post-content-dis">
                <p>${discussion.description}</p>
            </div>
            <div class="post-footer">
                <div class="likes-dislikes">
                    <button class="like-button" style="color: black;" data-liked="${likedByUser}">${likesText}</button>
                    <button class="dislike-button" style="color: black;" data-disliked="${dislikedByUser}">${dislikesText}</button>
                </div>
            </div>
        `;
    }

    // Function to fetch comments for a discussion
    async function fetchComments(discussionId) {
        try {
            const response = await fetchWithAuth(`/comments?discussionId=${discussionId}`, {
                method: 'GET'
            });
            if (!response.ok) {
                throw new Error(`Error fetching comments: ${response.statusText}`);
            }
            const comments = await response.json(); // Get comments data from response
            displayComments(comments); // Display the comments
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }    

    // Function to increment the number of likes for a comment
    async function incrementLikes(commentId, likeButton, dislikeButton) {
        try {

            // Check if the user already disliked the review
            if (dislikeButton.getAttribute('data-disliked') === 'true') {
                alert('You can only choose to like or dislike a comment.');
                return;
            }

            // Send a POST request to like the comment
            const response = await fetchWithAuth(`/comments/${commentId}/like`, {
                method: 'POST'
            });
            const data = await response.json(); // Parse the JSON response
            if (data.success) {
                // Update the like button text and status
                likeButton.textContent = `👍 ${data.likes} Likes`;
                likeButton.setAttribute('data-liked', 'true'); // Set the liked status
                dislikeButton.setAttribute('data-disliked', 'false'); // Ensure the dislike status is not set
            } else {
                alert('Error adding like.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding like.');
        }
    }

    // Function to increment the number of dislikes for a comment
    async function incrementDislikes(commentId, likeButton, dislikeButton) {
        try {
            // Check if the user already liked the review
            if (likeButton.getAttribute('data-liked') === 'true') {
                alert('You can only choose to like or dislike a comment.');
                return;
            }
        
             // Send a POST request to dislike the comment
            const response = await fetchWithAuth(`/comments/${commentId}/dislike`, {
                method: 'POST'
            });
            const data = await response.json(); // Parse the JSON response

            if (data.success) {
                // Update the dislike button text and status
                dislikeButton.textContent = `👎 ${data.dislikes} Dislikes`;
                dislikeButton.setAttribute('data-disliked', 'true'); // Set the disliked status
                likeButton.setAttribute('data-liked', 'false'); // Ensure the like status is not set
            } else {
                alert('Error adding dislike.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding dislike.');
        }
    }

    // Function to display comments
    function displayComments(comments) {
        const commentsSection = document.querySelector('.comments-section'); 
        commentsSection.innerHTML = ''; // Clear existing comments
        const token = getToken();
        const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); // Get the current user ID from session storage and convert to integer

        // Sort comments so newest comment appears at top
        comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
        comments.forEach(comment => { // Loop through each comment
            console.log(comment); // Log each comment to check if role is present
    
            const formattedUsername = formatUsername(comment.username); // Format the username
            const commentElement = document.createElement('div'); // Create a new comment element
            commentElement.classList.add('comment');
            commentElement.dataset.id = comment.id;
            commentElement.dataset.userId = comment.user_id;

            const likedByUser = comment.userLiked ? 'true' : 'false';
            const dislikedByUser = comment.userDisliked ? 'true' : 'false';

            const likesText = `👍 ${comment.likes || 0} Likes`;
            const dislikesText = `👎 ${comment.dislikes || 0} Dislikes`;
    
            // Set inner HTML of the comment element
            commentElement.innerHTML = `
                <div class="user-info">
                    <div class="avatar">
                        <img src="${comment.profilePic || 'images/profilePic.jpeg'}" alt="User Avatar">
                    </div>
                    <div class="username">${formattedUsername}</div>
                    <div class="role"> (${comment.role || 'Role not found'})</div> 
                </div>
                <div class="comment-content">${comment.content}</div>
                <p class="comment-date">Posted on: ${new Date(comment.created_at).toLocaleDateString()}</p>
                <div class="comment-actions">
                    <button class="like-button" style="color: black;" data-liked="${likedByUser}">${likesText}</button>
                    <button class="dislike-button " style="color: black;" data-disliked="${dislikedByUser}">${dislikesText}</button>
                    ${token && comment.user_id === currentUserId ? `<button class="delete-btn btn" onclick="deleteComment(this)">Delete</button>
                                                                    <button class="edit-btn btn" onclick="editComment(this)">Edit</button>` : ''}
                </div>
            `;

            // Get the like and dislike buttons
            const likeButton = commentElement.querySelector('.like-button');
            const dislikeButton = commentElement.querySelector('.dislike-button');

            // Event listener for the like button
            likeButton.addEventListener('click', function () {
                if (this.getAttribute('data-liked') === 'true') {
                    alert('You have already liked this comment.');
                    return;
                }
                if (dislikeButton.getAttribute('data-disliked') === 'true') {
                    alert('You can only choose to like or dislike a comment.');
                    return;
                }
                incrementLikes(comment.id, this, dislikeButton);  // Increment likes
            });

            // Event listener for the dislike button
            dislikeButton.addEventListener('click', function () {
                if (this.getAttribute('data-disliked') === 'true') {
                    alert('You have already disliked this comment.');
                    return;
                }
                if (likeButton.getAttribute('data-liked') === 'true') {
                    alert('You can only choose to like or dislike a review.');
                    return;
                }
                incrementDislikes(comment.id, likeButton, this); // Increment dislikes
            });
            
            commentsSection.appendChild(commentElement);
        });
    }

    // Function to fetch the number of comments for a specific discussion
    async function fetchCommentCountByDiscussionId(discussionId) {
        try {
            const response = await fetchWithAuth(`/comments/discussion/${discussionId}/count`, {
                method: 'GET'
            });

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);

            if (!response.ok) {
                console.error('Error response:', responseText);
                throw new Error('Failed to fetch comment count by discussion ID');
            }

            const data = JSON.parse(responseText); // Parse response text as JSON
            console.log('Parsed data:', data);

            const totalCommentsElement = document.getElementById('total-comments');  // Get the element displaying total comments
            if (totalCommentsElement) {
                totalCommentsElement.textContent = data.count; // Set the text content to the count of comments
            }
            
        } catch (error) {
            console.error('Error fetching comment count by discussion ID:', error);
        }
    }
        
    function formatUsername(username) {
        return username.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const discussionId = new URLSearchParams(window.location.search).get('discussionId'); // Get discussion ID from URL
    fetchDiscussionDetails(discussionId); // Fetch discussion details aka the main post for each discussion
    fetchComments(discussionId); // Fetch comments for the specific discussion
    fetchCommentCountByDiscussionId(discussionId);

    window.editComment = editComment;
    window.deleteComment = deleteComment;
    window.saveComment = saveComment;
    window.closePopup = closePopup;
});

// Function to fetch the token
function getToken() {
    return sessionStorage.getItem('token'); // Get the token from session storage
}