document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('popup');
    const closePopupBtn = document.querySelector('.popup .close');
    const addCommentBtn = document.getElementById('addCommentBtn'); // Add Comment button
    let editMode = false;
    let currentComment = null;
    let currentCommentId = null;
    const token = getToken();
    // const currentUserId = getUserIdFromToken(token); // Extract user ID from the token
    const currentUserId = parseInt(sessionStorage.getItem('userId'), 10);  // Get the current user ID from session storage and not decode token bc decode token to get user Id pose security concerns since sensitive info can be found using token


    // console.log('Current User ID:', currentUserId); // Debug log

    closePopupBtn.addEventListener('click', closePopup);

    // addCommentBtn.addEventListener('click', () => {
    //     if (token) {
    //         showPopup('add');
    //     } else {
    //         alert('Please log in or sign up to add comments.');
    //     }
    // });

    if (token) {
        addCommentBtn.addEventListener('click', () => {
            showPopup('add');
        });
    } else {
        addCommentBtn.style.display = 'none';
    }

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
            saveButton.onclick = saveComment; // Set onclick to saveComment for adding new comments
        } else {
            popupTitle.textContent = 'Edit Comment';
            commentText.value = currentComment.querySelector('.comment-content').textContent.trim();
            editMode = true;
            saveButton.onclick = saveComment; // Set onclick to saveComment for editing comments
        }

        popup.style.display = 'flex';
    }

    function closePopup() {
        popup.style.display = 'none';
    }

    // -- this requires jwt
    // async function saveComment() {
    //     const commentText = document.getElementById('comment-text').value;
    //     const discussionId = new URLSearchParams(window.location.search).get('discussionId'); // Get discussion ID from URL
    
    //     if (editMode && currentComment) {
    //         try {
    //             const response = await fetch(`/comments/${currentCommentId}`, {
    //                 method: 'PUT',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${token}`
    //                 },
    //                 body: JSON.stringify({ content: commentText, discussionId: parseInt(discussionId, 10) })
    //             });
    //             if (response.ok) {
    //                 currentComment.querySelector('.comment-content').textContent = commentText;
    //                 closePopup();
    //                 alert('Comment updated successfully!');
    //             } else {
    //                 const errorData = await response.json();
    //                 console.error('Failed to update comment:', errorData.error || response.statusText);
    //             }
    //         } catch (error) {
    //             console.error('Error:', error);
    //         }
    //     } else {
    //         await postComment(commentText, discussionId);
    //         closePopup();
    //     }
    // }

    async function saveComment() {
        const commentText = document.getElementById('comment-text').value;
        const discussionId = new URLSearchParams(window.location.search).get('discussionId');
    
        try {
            const response = editMode && currentComment
                ? await fetchWithAuth(`/comments/${currentCommentId}`, { // ------------------------------------------------- headers in jwtutility.js
                    method: 'PUT',
                    body: JSON.stringify({ content: commentText, discussionId: parseInt(discussionId, 10) })
                })
                : await fetchWithAuth('/comments', { // ------------------------------------------------- headers in jwtutility.js
                    method: 'POST',
                    body: JSON.stringify({ content: commentText, discussionId: parseInt(discussionId, 10) })
                });
    
            if (response.ok) { // response && response.ok
                if (editMode && currentComment) {
                    currentComment.querySelector('.comment-content').textContent = commentText;
                    alert('Comment updated successfully!');
                } else {
                    alert('Comment posted successfully!');
                    fetchComments(discussionId); // Refresh comments for the specific discussion
                }
                closePopup();
            } else {
                const errorData = await response.json();
                alert(errorData.error || response.statusText); // Show alert for validation error
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
            
    //This requires jwt
    async function postComment(text, discussionId) {
        try {
            const response = await fetchWithAuth('/comments', { // ------------------------------------------------- headers in jwtutility.js
                method: 'POST',
                body: JSON.stringify({ content: text, discussionId: parseInt(discussionId, 10) }) // Ensure discussionId is an integer
            });
            if (response.ok) { // response && response.ok
                alert('Comment posted successfully!');
                fetchComments(discussionId); // Refresh comments for the specific discussion
            } else {
                const errorData = await response.json();
                alert(errorData.error || response.statusText); // Show alert for validation error
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
                        
    // -- this requires jwt
    window.deleteComment = async function(button) {
        const comment = button.closest('.comment');
        const commentId = comment.dataset.id;
    
        try {
            const response = await fetchWithAuth(`/comments/${commentId}`, { // ------------------------------------------------- headers in jwtutility.js
                method: 'DELETE'
            });
    
            console.log('Response status:', response.status); // To debug
    
            if (response.status === 403) { // response && response.status === 403
                alert('You can only delete your own comments.');
            } else if (response.ok) { // response && response.ok
                if (confirm("Are you sure you want to delete this comment?")) {
                    comment.remove();
                    alert('Comment deleted successfully!');
                }
            } else {
                console.error('Failed to delete comment:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };    

    // -- this requires jwt
    window.editComment = function(button) {
        const comment = button.closest('.comment');
        const commentUserId = parseInt(comment.dataset.userId, 10); // Get the user ID from the comment
        const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); // Get the current user ID from session storage and convert to integer
    
        console.log('Comment User ID:', commentUserId); // Debug log
        console.log('Current User ID:', currentUserId); // Debug log
    
        if (commentUserId === currentUserId) {
            currentComment = comment;
            currentCommentId = comment.dataset.id;
            console.log('Current Comment ID:', currentCommentId); // Debug log
            showPopup('edit');
        } else {
            alert('You can only edit your own comments.');
        }
    };
    
    
    // window.editComment = function(button) {
    //     const comment = button.closest('.comment');
    //     const commentUserId = parseInt(comment.dataset.userId, 10); // Get the user ID from the comment

    //     console.log('Comment User ID:', comment.dataset.userId); // Debug log
    //     console.log('Comment User ID (parsed):', commentUserId); // Debug log

    //     if (commentUserId === parseInt(currentUserId, 10)) {
    //         currentComment = comment;
    //         currentCommentId = comment.dataset.id;
    //         console.log('Current Comment ID:', currentCommentId); // Debug log
    //         showPopup('edit');
    //     } else {
    //         alert('You can only edit your own comments.');
    //     }
    // };

    async function fetchDiscussionDetails(discussionId) {
        try {
            const response = await fetchWithAuth(`/discussions/${discussionId}`); // ------------------------------------------------- headers in jwtutility.js
            if (!response.ok) {
                throw new Error(`Error fetching discussion: ${response.statusText}`);
            }
            const discussion = await response.json();
            console.log('Discussion details:', discussion); // Debug log
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
    
        // hi i change this 
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

    async function fetchComments(discussionId) {
        try {
            const response = await fetch(`/comments?discussionId=${discussionId}`);
            if (!response.ok) {
                throw new Error(`Error fetching comments: ${response.statusText}`);
            }
            const comments = await response.json();
            displayComments(comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
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
                    ${token && comment.user_id === currentUserId ? `<button class="delete-btn btn" onclick="deleteComment(this)">Delete</button>
                                                                    <button class="edit-btn btn" onclick="editComment(this)">Edit</button>` : ''}
                </div>
            `;
            commentsSection.appendChild(commentElement);
        });
    }
        
    function formatUsername(username) {
        return username.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const discussionId = new URLSearchParams(window.location.search).get('discussionId'); // Get discussion ID from URL
    fetchDiscussionDetails(discussionId); // Fetch discussion details
    fetchComments(discussionId); // Fetch comments for the specific discussion

    window.saveComment = saveComment;
    window.closePopup = closePopup;
});

function getToken() {
    return sessionStorage.getItem('token');
}

// function getUserIdFromToken(token) {
//     if (!token) return null;
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     return payload.id;
// }