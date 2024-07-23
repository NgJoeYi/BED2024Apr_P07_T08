document.addEventListener('DOMContentLoaded', () => {

    // Fetch elements
    const popup = document.getElementById('popup');
    const closePopupBtn = document.querySelector('.popup .close');
    const addCommentBtn = document.getElementById('addCommentBtn'); 

    let editMode = false;
    let currentComment = null;
    let currentCommentId = null;

    const token = getToken();
    const currentUserId = parseInt(sessionStorage.getItem('userId'), 10);  // Get the current user ID from session storage and not decode token bc decode token to get user Id pose security concerns since sensitive info can be found using token

    // Event listener to close pop up
    closePopupBtn.addEventListener('click', closePopup);

    // Only if have token, will show Add Comment button
    if (token) {
        addCommentBtn.addEventListener('click', () => {
            showPopup('add');
        });
    } else {
        addCommentBtn.style.display = 'none';
    }

    // Pop up is for Add Comment and for Edit Comment, so need 'type' to differentiate them
    function showPopup(type) {
        const popupTitle = popup.querySelector('h2');
        const commentText = document.getElementById('comment-text');
        const saveButton = popup.querySelector('button');

        if (type === 'add') {
            popupTitle.textContent = 'Leave a Comment';
            commentText.value = '';
            editMode = false;
            currentComment = null;
            currentCommentId = null;
            saveButton.onclick = saveComment;
        } else {
            popupTitle.textContent = 'Edit Comment';
            commentText.value = currentComment.querySelector('.comment-content').textContent.trim();
            editMode = true;
            saveButton.onclick = saveComment; 
        }

        popup.style.display = 'flex';
    }

    function closePopup() {
        popup.style.display = 'none';
    }

    async function saveComment() {
        const commentText = document.getElementById('comment-text').value;
        const discussionId = new URLSearchParams(window.location.search).get('discussionId');
    
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
                const errorData = await response.json();
                alert(errorData.error || response.statusText); // Show alert for error
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
                        
    async function deleteComment(button) {
        const comment = button.closest('.comment');
        const commentId = comment.dataset.id;
    
        try {
            const response = await fetchWithAuth(`/comments/${commentId}`, {
                method: 'DELETE'
            });
    
            console.log('Response status:', response.status);

            if (response.ok){
                if (confirm("Are you sure you want to delete this comment?")) {
                    comment.remove();
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

        // 'button.closest' is to ensure I edit the right comment that I want to edit ---> I can have 2 diff comments, but the edit button for both comments are named the same. So need use button.closest to ensure I am editing my desired comment and not my other comment. (button.closest = will take the nearest comment where you clicked the button)
        const comment = button.closest('.comment');
        const commentUserId = parseInt(comment.dataset.userId, 10);
        const currentUserId = parseInt(sessionStorage.getItem('userId'), 10);
        
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
                throw new Error(`Error fetching discussion: ${response.statusText}`);
            }
            const discussion = await response.json();
            if (!discussion) {
                throw new Error('Discussion not found');
            }
            displayDiscussionDetails(discussion);
        } catch (error) {
            console.error('Error fetching discussion details:', error);
        }
    }

    function displayDiscussionDetails(discussion) {
        if (!discussion) {
            console.error('No discussion details to display');
            return;
        }
    
        const mainPost = document.getElementById('main-post');
        if (!mainPost) {
            console.error('main-post element not found');
            return;
        }
    
        const capitalizedUsername = capitalizeFirstLetter(discussion.username);
        const likedByUser = discussion.userLiked; // should be a boolean
        const dislikedByUser = discussion.userDisliked; // should be a boolean
    
        const likesText = `👍 ${discussion.likes} Likes`;
        const dislikesText = `👎 ${discussion.dislikes} Dislikes`;
    
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
                    <button class="like-button" data-liked="${likedByUser}">${likesText}</button>
                    <button class="dislike-button" data-disliked="${dislikedByUser}">${dislikesText}</button>
                </div>
            </div>
        `;
    }

    // async function fetchComments(discussionId) {
    //     try {
    //         const response = await fetch(`/comments?discussionId=${discussionId}`);
    //         if (!response.ok) {
    //             throw new Error(`Error fetching comments: ${response.statusText}`);
    //         }
    //         const comments = await response.json();
    //         displayComments(comments);
    //     } catch (error) {
    //         console.error('Error fetching comments:', error);
    //     }
    // }

    async function fetchComments(discussionId) {
        try {
            const response = await fetchWithAuth(`/comments?discussionId=${discussionId}`, {
                method: 'GET'
            });
            if (!response.ok) {
                throw new Error(`Error fetching comments: ${response.statusText}`);
            }
            const comments = await response.json();
            displayComments(comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }    

    async function incrementLikes(commentId, likeButton, dislikeButton) {
        try {

            // Check if the user already disliked the review
            if (dislikeButton.getAttribute('data-disliked') === 'true') {
                alert('You can only choose to like or dislike a comment.');
                return;
            }

            const response = await fetchWithAuth(`/comments/${commentId}/like`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                likeButton.textContent = `👍 ${data.likes} Likes`;
                likeButton.setAttribute('data-liked', 'true');
                dislikeButton.setAttribute('data-disliked', 'false');
            } else {
                alert('Error adding like.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding like.');
        }
    }

    async function incrementDislikes(commentId, likeButton, dislikeButton) {
        try {
            // Check if the user already liked the review
            if (likeButton.getAttribute('data-liked') === 'true') {
                alert('You can only choose to like or dislike a comment.');
                return;
            }
        
            const response = await fetchWithAuth(`/comments/${commentId}/dislike`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                dislikeButton.textContent = `👎 ${data.dislikes} Dislikes`;
                dislikeButton.setAttribute('data-disliked', 'true');
                likeButton.setAttribute('data-liked', 'false');
            } else {
                alert('Error adding dislike.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding dislike.');
        }
    }

    function displayComments(comments) {
        const commentsSection = document.querySelector('.comments-section');
        commentsSection.innerHTML = ''; // Clear existing comments
        const token = getToken();
        const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); // Get the current user ID from session storage and convert to integer

        // Sort comments so newest comment appears at top
        comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
        comments.forEach(comment => {
            console.log(comment); // Log each comment to check if role is present
    
            const formattedUsername = formatUsername(comment.username);
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');
            commentElement.dataset.id = comment.id;
            commentElement.dataset.userId = comment.user_id;

            const likedByUser = comment.userLiked ? 'true' : 'false';
            const dislikedByUser = comment.userDisliked ? 'true' : 'false';

            const likesText = `👍 ${comment.likes || 0} Likes`;
            const dislikesText = `👎 ${comment.dislikes || 0} Dislikes`;
    
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
                    <button class="like-button" data-liked="${likedByUser}">${likesText}</button>
                    <button class="dislike-button" data-disliked="${dislikedByUser}">${dislikesText}</button>
                    ${token && comment.user_id === currentUserId ? `<button class="delete-btn btn" onclick="deleteComment(this)">Delete</button>
                                                                    <button class="edit-btn btn" onclick="editComment(this)">Edit</button>` : ''}
                </div>
            `;

            const likeButton = commentElement.querySelector('.like-button');
            const dislikeButton = commentElement.querySelector('.dislike-button');

            likeButton.addEventListener('click', function () {
                if (this.getAttribute('data-liked') === 'true') {
                    alert('You have already liked this comment.');
                    return;
                }
                if (dislikeButton.getAttribute('data-disliked') === 'true') {
                    alert('You can only choose to like or dislike a comment.');
                    return;
                }
                incrementLikes(comment.id, this, dislikeButton);
            });

            dislikeButton.addEventListener('click', function () {
                if (this.getAttribute('data-disliked') === 'true') {
                    alert('You have already disliked this comment.');
                    return;
                }
                if (likeButton.getAttribute('data-liked') === 'true') {
                    alert('You can only choose to like or dislike a review.');
                    return;
                }
                incrementDislikes(comment.id, likeButton, this);
            });
            
            commentsSection.appendChild(commentElement);
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

            if (!response.ok) {
                console.error('Error response:', responseText);
                throw new Error('Failed to fetch comment count by discussion ID');
            }

            const data = JSON.parse(responseText);
            console.log('Parsed data:', data);

            const totalCommentsElement = document.getElementById('total-comments');
            // totalCommentsElement.textContent = data.count;
            if (totalCommentsElement) {
                totalCommentsElement.textContent = data.count;
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

function getToken() {
    return sessionStorage.getItem('token');
}