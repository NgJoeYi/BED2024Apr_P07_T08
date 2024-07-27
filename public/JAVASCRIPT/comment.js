document.addEventListener('DOMContentLoaded', () => {

    const popup = document.getElementById('popup'); // Get the popup element by its ID
    const addCommentBtn = document.getElementById('addCommentBtn'); // Get the add comment button by its ID

    let editMode = false; // Track if are in edit mode
    let currentComment = null; // Store the current comment being edited
    let currentCommentId = null; // Store the ID of the current comment being edited

    const token = getToken(); // Retrieve the authentication token from session storage
    const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); // Get the current user ID from session storage and convert it to an integer
    const currentUser = { 
        profilePic: sessionStorage.getItem('profilePic') || 'images/profilePic.jpeg' // Retrieve the current user's profile picture or use a default image if not available (Added this for Gignite)
    };

    if (token) { // If the user is authenticated
        addCommentBtn.addEventListener('click', () => {
            showPopup('add'); 
        });
    } else { // If the user is not authenticated
        addCommentBtn.style.display = 'none'; 
    }

    function showPopup(type) {
        const popupTitle = popup.querySelector('h2');
        const commentText = document.getElementById('comment-text');
        const saveButton = popup.querySelector('button');
        const cancelButton = popup.querySelector('.cancel-btn');
        const avatarImg = popup.querySelector('.avatar img');

        if (type === 'add') { // If the popup is for adding a new comment
            popupTitle.textContent = 'Leave a Comment';
            commentText.value = ''; // Clear the comment text input
            avatarImg.src = currentUser.profilePic; // Set the avatar image to the current user's profile picture
            editMode = false; // Set edit mode to false
            currentComment = null;  // Clear the current comment
            currentCommentId = null; // Clear the current comment ID
            saveButton.onclick = saveComment;

        } else { // If the popup is for editing an existing comment
            popupTitle.textContent = 'Edit Comment';
            commentText.value = currentComment.querySelector('.comment-content').textContent.trim(); // Set the comment text input to the current comment's content
            avatarImg.src = currentComment.querySelector('.avatar img').src;  // Set the avatar image to the current comment's avatar image (Gignite)
            editMode = true; // Set edit mode to true
            saveButton.onclick = saveComment;  
        }

        cancelButton.onclick = closePopup; // Set the cancel button's onclick event to close the popup
        popup.style.display = 'flex'; // Display the popup
    }

    function closePopup() {
        popup.style.display = 'none'; // Hide the popup
    }

    async function saveComment() {
        const commentText = document.getElementById('comment-text').value; // Get the comment text input value
        const discussionId = new URLSearchParams(window.location.search).get('discussionId'); // Get the discussion ID from the URL
    
        try {
            const response = editMode && currentComment // If in edit mode, send a PUT request to update the comment
                ? await fetchWithAuth(`/comments/${currentCommentId}`, { 
                    method: 'PUT',
                    body: JSON.stringify({ content: commentText, discussionId: parseInt(discussionId, 10) })
                })
                : await fetchWithAuth('/comments', { // If not in edit mode, send a POST request to create a new comment
                    method: 'POST',
                    body: JSON.stringify({ content: commentText, discussionId: parseInt(discussionId, 10) })
                });
    
            if (response.ok) { 
                const updatedComment = await response.json();
                if (editMode && currentComment) { // If in edit mode, update the current comment's content
                    currentComment.querySelector('.comment-content').textContent = commentText;

                    // Remove existing translation elements
                    currentComment.querySelector('.comment-translated-content')?.remove();
                    currentComment.querySelector('.comment-source-language')?.remove();

                    // Create new translation HTML if necessary (aka if updatedComment not in english)
                    const translationHTML = updatedComment.sourceLanguage && updatedComment.sourceLanguage !== 'en' 
                        ? `<div class="comment-translated-content">Translation: ${updatedComment.translatedContent || 'No translation available'}</div>
                        <div class="comment-source-language">Detected language: ${updatedComment.sourceLanguage}</div>`
                    : '';

                    // Insert translation HTML before the comment-actions element
                    const commentActions = currentComment.querySelector('.comment-actions');
                    if (commentActions) {
                        commentActions.insertAdjacentHTML('beforebegin', translationHTML);
                    }         

                    alert('Comment updated successfully!');

                } else {
                    alert('Comment posted successfully!');
                    fetchComments(discussionId); // To get the newly created comment without user manually refreshing
                }
                closePopup();
            } else {
                const errorData = await response.json();
                alert(errorData.error || response.statusText); // Alert the error message
            }
        } catch (error) {
            console.error('Error:', error); // Logging down the error
        }
    }    

    async function postComment(text, discussionId) {
        try {
            const response = await fetchWithAuth('/comments', { 
                method: 'POST',
                body: JSON.stringify({ content: text, discussionId: parseInt(discussionId, 10) })
            });
            if (response.ok) { // Posting of comments succesful
                alert('Comment posted successfully!'); // Success message
                fetchComments(discussionId); // Refresh
            } else {
                const errorData = await response.json(); 
                alert(errorData.error || response.statusText);  // Alert error
            }
        } catch (error) {
            console.error('Error:', error); // Log error
        }
    }
        
    async function deleteComment(button) {
        const comment = button.closest('.comment'); // Get the closest comment element
        const commentId = comment.dataset.id; // Get the comment ID from the data attribute
    
        try {
            const response = await fetchWithAuth(`/comments/${commentId}`, {
                method: 'DELETE'
            });

            console.log('Response status:', response.status); 

            if (response.ok){
                if (confirm("Are you sure you want to delete this comment?")) {
                    comment.remove(); // Remove the comment element
                    alert('Comment deleted successfully!');
                }
            }
            else{
                console.error('Failed to delete comment:', response.statusText);
            }
    
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    async function editComment(button) {
        const comment = button.closest('.comment');
        const commentUserId = parseInt(comment.dataset.userId, 10); // Get the comment user ID from the data attribute
        const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); // Get the current user ID from session storage
        
        if (commentUserId === currentUserId) {
            currentComment = comment; // Set the current comment
            currentCommentId = comment.dataset.id; // Set the current comment ID
            showPopup('edit'); // Show popup for editing
        } else {
            alert('You can only edit your own comments.');
        }
    }
        
   
// -------------------------------------------------------------------------RAEANN - DiscussionDetails--------------------------------------------------------------
    // Add an event listener that runs when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Get query parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);
    // Extract the discussionId from the query parameters
    const discussionId = urlParams.get('discussionId');
    // Fetch discussion details using the discussionId
    fetchDiscussionDetails(discussionId);
});

// Async function to fetch discussion details from the server
async function fetchDiscussionDetails(discussionId) {
    try {
        // Make an authenticated request to get discussion details
        const response = await fetchWithAuth(`/discussions/${discussionId}`);
        // Check if the response is not ok (e.g., HTTP status code is not 200)
        if (!response.ok) {
            throw new Error(`Error fetching discussion: ${response.statusText}`);
        }
        // Parse the response JSON
        const data = await response.json();
        // Check if the API call was successful
        if (data.success) {
            console.log('Fetched discussion data:', data.discussion);
            // Display discussion details
            displayDiscussionDetails(data.discussion);
        } else {
            console.error('Error fetching discussion:', data.error);
        }
    } catch (error) {
        // Log any errors encountered during the fetch operation
        console.error('Error fetching discussion details:', error);

    }
}

// Function to display the discussion details on the page
function displayDiscussionDetails(discussion) {
    if (!discussion) {
        console.error('No discussion details to display');
        return;
    }
  
    // Get the HTML element where the discussion will be displayed
    const mainPost = document.getElementById('main-post'); 
    if (!mainPost) {
        console.error('main-post element not found');
        return;
    }

    // Capitalize the first letter of the username
    const capitalizedUsername = capitalizeFirstLetter(discussion.username);
    // Check if the user liked or disliked the post
    const likedByUser = discussion.userLiked; 
    const dislikedByUser = discussion.userDisliked; 

    // Prepare text for likes and dislikes
    const likesText = `👍 ${discussion.likes} Likes`;
    const dislikesText = `👎 ${discussion.dislikes} Dislikes`;

    // Update the inner HTML of the mainPost element with the discussion details
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

// Function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Async function to fetch comments related to the discussion
async function fetchComments(discussionId) {
    try {
        // Make an authenticated request to get comments for the discussion
        const response = await fetchWithAuth(`/comments?discussionId=${discussionId}`, {
            method: 'GET'
        });
        // Check if the response is not ok (e.g., HTTP status code is not 200)
        if (!response.ok) {
            throw new Error(`Error fetching comments: ${response.statusText}`);

        }
        // Parse the response JSON
        const comments = await response.json(); 
        // Display comments (assuming a function displayComments exists)
        displayComments(comments); 
    } catch (error) {
        // Log any errors encountered during the fetch operation
        console.error('Error fetching comments:', error);
    }
}


    // --------------------------------------------------------------------------end of discussiondetials------------------------------------------------------------

    async function incrementLikes(commentId, likeButton, dislikeButton) {
        try {
            const userId = sessionStorage.getItem('userId'); // Retrieve userId from sessionStorage
            if (!userId) { // No userId
                alert('User ID is required');
                return;
            }
    
            // POST request to like the comment, not PUT (liking , disliking comments has nothing to do with PUT since is not updating)
            const response = await fetchWithAuth(`/comments/${commentId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }) // Include userId in the request body
            });
            
            const data = await response.json();
            if (data.success) {
                likeButton.textContent = `👍 ${data.likes} Likes`; // Update the like button text and attributes based on the response
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
    
    async function incrementDislikes(commentId, likeButton, dislikeButton) {
        try {
            const userId = sessionStorage.getItem('userId'); // Retrieve userId from sessionStorage
            if (!userId) {
                alert('User ID is required');
                return;
            }
    
            // POST request to dislike the comment
            const response = await fetchWithAuth(`/comments/${commentId}/dislike`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }) // Include userId in the request body
            });
    
            const data = await response.json();
            if (data.success) {
                dislikeButton.textContent = `👎 ${data.dislikes} Dislikes`; // Update the dislike button text and attributes based on the response
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
             
    function displayComments(comments) {
        const commentsSection = document.querySelector('.comments-section'); 
        commentsSection.innerHTML = ''; // Clear previous comments
        const token = getToken(); // Get authentication token
        const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); 

        // Initial organization of comments is by the date they were posted
        comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
        comments.forEach(comment => { 
            console.log(comment); 
    
            const formattedUsername = formatUsername(comment.username);
            const commentElement = document.createElement('div'); // Create a div element for the comment
            commentElement.classList.add('comment');
            commentElement.dataset.id = comment.id; // Set the comment ID as a data attribute
            commentElement.dataset.userId = comment.user_id; // Set the user ID as a data attribute

            const likedByUser = comment.userLiked ? 'true' : 'false';
            const dislikedByUser = comment.userDisliked ? 'true' : 'false';

            const likesText = `👍 ${comment.likes || 0} Likes`;
            const dislikesText = `👎 ${comment.dislikes || 0} Dislikes`;

            // HTML for the comment translation if applicable
            let translationHTML = '';
            if (comment.sourceLanguage && comment.sourceLanguage !== 'en') {
                translationHTML = `
                    <div class="comment-translated-content">Translation:${comment.translatedContent || 'No translation available'}</div>
                    <div class="comment-source-language">Detected language: ${comment.sourceLanguage}</div>
                `;
            }
    
            commentElement.innerHTML = `
                <div class="user-info">
                    <div class="avatar">
                        <img src="${comment.profilePic || 'images/profilePic.jpeg'}" alt="User Avatar">
                    </div>
                    <div class="username">${formattedUsername}</div>
                    <div class="role"> (${comment.role || 'Role not found'})</div> 
                </div>
                <div class="comment-content">${comment.content}</div>
                ${translationHTML}
                <p class="comment-date">Posted on: ${new Date(comment.created_at).toLocaleDateString()}</p>
                <div class="comment-actions">
                    <button class="like-button" style="color: black;" data-liked="${likedByUser}">${likesText}</button>
                    <button class="dislike-button" style="color: black;" data-disliked="${dislikedByUser}">${dislikesText}</button>
                    ${token && comment.user_id === currentUserId ? `<button class="delete-btn btn" onclick="deleteComment(this)">Delete</button>
                                                                    <button class="edit-btn btn" onclick="editComment(this)">Edit</button>` : ''}
                </div>
            `;

            const likeButton = commentElement.querySelector('.like-button');
            const dislikeButton = commentElement.querySelector('.dislike-button');

             // Add event listener for the like button
            likeButton.addEventListener('click', function () {
                if (dislikeButton.getAttribute('data-disliked') === 'true') {
                    alert('You can only like or dislike a comment.');
                    return;
                }
                incrementLikes(comment.id, this, dislikeButton); // Call incrementLikes on click
            });

            // Add event listener for the dislike button
            dislikeButton.addEventListener('click', function () {
                if (likeButton.getAttribute('data-liked') === 'true') {
                    alert('You can only like or dislike a comment.');
                    return;
                }
                incrementDislikes(comment.id, likeButton, this);  // Call incrementDislikes on click
            });
            
            commentsSection.appendChild(commentElement); // Add the comment element to the comments section
        });
    }        

    async function fetchCommentCountByDiscussionId(discussionId) {
        try {
            const response = await fetchWithAuth(`/comments/discussion/${discussionId}/count`, {
                method: 'GET'
            });

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);

            if (!response.ok) { // Log and throw an error if the response is not OK
                console.error('Error response:', responseText);
                throw new Error('Failed to fetch comment count by discussion ID');
            }

            const data = JSON.parse(responseText); // Parse the response text as JSON
            console.log('Parsed data:', data);

            const totalCommentsElement = document.getElementById('total-comments'); 
            if (totalCommentsElement) {
                totalCommentsElement.textContent = data.count; // Update the total comments element along with the fetched count
            }
            
        } catch (error) {
            console.error('Error fetching comment count by discussion ID:', error); // Log any errors that occur during the fetch
        }
    }
        
    // Format username by capitalizing the first letter of each word
    function formatUsername(username) {
        return username.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // To get the discussion ID from the URL parameters
    const discussionId = new URLSearchParams(window.location.search).get('discussionId'); 
    fetchDiscussionDetails(discussionId); // Get details for the discussion
    fetchComments(discussionId); // Get comments for the discussion
    fetchCommentCountByDiscussionId(discussionId); // Get the comment count for the discussion

    // Assign these as global window object for external use
    window.editComment = editComment;
    window.deleteComment = deleteComment;
    window.saveComment = saveComment;
    window.closePopup = closePopup;
});

function getToken() {
    return sessionStorage.getItem('token'); // To get the authentication token from sessionStorage
}
