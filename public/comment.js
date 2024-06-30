document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('popup');
    const closePopupBtn = document.querySelector('.popup .close');
    const addCommentBtn = document.getElementById('addCommentBtn'); // Add Comment button
    let editMode = false;
    let currentComment = null;
    let currentCommentId = null;
    const currentUserId = sessionStorage.getItem('userId'); // Get the current user ID from session storage

    console.log('Current User ID:', currentUserId); // Debug log

    closePopupBtn.addEventListener('click', closePopup);
    // addCommentBtn.addEventListener('click', () => showPopup('add')); // Show popup for adding a new comment

    addCommentBtn.addEventListener('click', () => {
        if (currentUserId) {
            showPopup('add');
        } else {
            alert('Please log in or sign up to add comments.');
        }
    });

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

    async function saveComment() {
        const commentText = document.getElementById('comment-text').value;
        const discussionId = new URLSearchParams(window.location.search).get('discussionId'); // Get discussion ID from URL
        console.log('Discussion ID:', discussionId); // Debug log

        if (commentText) {
            if (editMode && currentComment) {
                try {
                    const response = await fetch(`/comments/${currentCommentId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ content: commentText, userId: currentUserId })
                    });
                    if (response.ok) {
                        currentComment.querySelector('.comment-content').textContent = commentText;
                        closePopup();
                        alert('Comment updated successfully!');
                    } else {
                        console.error('Failed to update comment:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            } else {
                await postComment(commentText, discussionId);
                closePopup();
            }
        }
    }

    async function postComment(text, discussionId) {
        console.log('Posting Comment:', text); // Debug log
        console.log('Discussion ID:', discussionId); // Debug log
    
        try {
            const response = await fetch('/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: text, userId: currentUserId, discussionId: discussionId })
            });
            if (response.ok) {
                alert('Comment posted successfully!');
                fetchComments(discussionId); // Refresh comments for the specific discussion
            } else {
                console.error('Failed to post comment:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    window.deleteComment = async function(button) {
        const comment = button.closest('.comment');
        const commentId = comment.dataset.id;
        const commentUserId = parseInt(comment.dataset.userId, 10); // Get the user ID from the comment

        if (commentUserId === parseInt(currentUserId, 10)) {
            if (confirm("Are you sure you want to delete this comment?")) {
                try {
                    const response = await fetch(`/comments/${commentId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ userId: currentUserId })
                    });

                    console.log('Response status:', response.status) //To debug
                    
                    if (response.ok) {
                        comment.remove();
                        alert('Comment deleted successfully!');
                    } else {
                        console.error('Failed to delete comment:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        } else {
            alert('You can only delete your own comments.');
        }
    };

    window.editComment = function(button) {
        const comment = button.closest('.comment');
        const commentUserId = parseInt(comment.dataset.userId, 10); // Get the user ID from the comment

        console.log('Comment User ID:', comment.dataset.userId); // Debug log
        console.log('Comment User ID (parsed):', commentUserId); // Debug log
        console.log('Current User ID:', parseInt(currentUserId, 10)); // Debug log

        if (commentUserId === parseInt(currentUserId, 10)) {
            currentComment = comment;
            currentCommentId = comment.dataset.id;
            console.log('Current Comment ID:', currentCommentId); // Debug log
            showPopup('edit');
        } else {
            alert('You can only edit your own comments.');
        }
    };

    async function fetchDiscussionDetails(discussionId) {
        try {
            const response = await fetch(`/discussions/${discussionId}`);
            const discussion = await response.json();
            displayDiscussionDetails(discussion);
        } catch (error) {
            console.error('Error fetching discussion details:', error);
        }
    }
    

    function displayDiscussionDetails(discussion) {
        const mainPost = document.getElementById('main-post');
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

    async function fetchComments(discussionId) {
        try {
            const response = await fetch(`/comments?discussionId=${discussionId}`);
            const comments = await response.json();
            displayComments(comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }    

    function displayComments(comments) {
        const commentsSection = document.querySelector('.comments-section');
        commentsSection.innerHTML = ''; // Clear existing comments

        comments.forEach(comment => {
            const formattedUsername = formatUsername(comment.username);
            const commentElement = document.createElement('div');

            commentElement.classList.add('comment');
            commentElement.dataset.id = comment.id;
            commentElement.dataset.userId = comment.user_id; // Add user ID to comment element
            console.log(`Comment ID: ${comment.id}, User ID: ${comment.user_id}`); // Debug log for each comment
            commentElement.innerHTML = `
                <div class="user-info">
                    <div class="avatar">
                        <img src="images/profilePic2" alt="User Avatar">
                    </div>
                    <div class="username">${formattedUsername}</div>
                </div>
                <div class="comment-content">${comment.content}</div>
                <p class="comment-date">Posted on: ${new Date(comment.created_at).toLocaleDateString()}</p>
                <div class="comment-actions">
                    <button class="delete-btn btn" onclick="deleteComment(this)">Delete</button>
                    <button class="edit-btn btn" onclick="editComment(this)">Edit</button>
                </div>
            `;
            commentsSection.appendChild(commentElement);
        });
    }

    function formatUsername(username) {
        return username.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const discussionId = new URLSearchParams(window.location.search).get('discussionId'); // Get discussion ID from URL
    fetchDiscussionDetails(discussionId); // Fetch discussion details
    fetchComments(discussionId); // Fetch comments for the specific discussion


    window.saveComment = saveComment;
    window.closePopup = closePopup;
});
