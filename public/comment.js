document.addEventListener('DOMContentLoaded', () => {
    const addCommentBtn = document.getElementById('addCommentBtn');
    const popup = document.getElementById('popup');
    const closePopupBtn = document.querySelector('.popup .close');
    let editMode = false;
    let currentComment = null;
    let currentCommentId = null;
    const currentUserId = sessionStorage.getItem('userId'); // Get the current user ID from session storage

    console.log('Current User ID:', currentUserId); // Debug log

    addCommentBtn.addEventListener('click', () => {
        showPopup('add');
    });

    closePopupBtn.addEventListener('click', closePopup);

    function showPopup(type) {
        const popupTitle = popup.querySelector('h2');
        const commentText = document.getElementById('comment-text');

        if (type === 'add') {
            popupTitle.textContent = 'Leave a Comment';
            commentText.value = '';
            editMode = false;
            currentComment = null;
            currentCommentId = null;
            const saveButton = popup.querySelector('button');
            saveButton.onclick = saveComment; // Set onclick to saveComment for adding new comments
        } else {
            popupTitle.textContent = 'Edit Comment';
            commentText.value = currentComment.querySelector('.comment-content').textContent.trim();
            editMode = true;
            const saveButton = popup.querySelector('button');
            saveButton.onclick = saveComment; // Set onclick to saveComment for editing comments
        }

        popup.style.display = 'flex';
    }

    function closePopup() {
        popup.style.display = 'none';
    }

    async function saveComment() {
        const commentText = document.getElementById('comment-text').value;
        const mainCommentId = document.getElementById('main-post').dataset.mainCommentId;
        console.log('Main Comment ID:', mainCommentId); // Debug log

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
                        console.error('Failed to update comment');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            } else {
                await postComment(commentText, mainCommentId);
                closePopup();
            }
        }
    }

    async function postComment(text, parentCommentId) {
        console.log('Posting Comment:', text); // Debug log
        console.log('Parent Comment ID:', parentCommentId); // Debug log

        try {
            const response = await fetch('/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: text, userId: currentUserId, parent_comment_id: parentCommentId })
            });
            if (response.ok) {
                alert('Comment posted successfully!');
                fetchComments(); // Refresh comments
            } else {
                console.error('Failed to post comment');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    window.deleteComment = function(button) {
        const comment = button.closest('.comment');
        if (confirm("Are you sure you want to delete this comment?")) {
            comment.remove();
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

    async function fetchComments() {
        try {
            const response = await fetch('/comments');
            const comments = await response.json();
            displayComments(comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }

    function displayComments(comments) {
        const mainPost = document.getElementById('main-post');
        const commentsSection = document.querySelector('.comments-section');
        mainPost.innerHTML = '';
        commentsSection.innerHTML = ''; // Clear existing comments

        comments.forEach(comment => {
            const formattedUsername = formatUsername(comment.username);
            const commentElement = document.createElement('div');

            if (comment.parent_comment_id === null) {
                commentElement.classList.add('post');
                commentElement.dataset.mainCommentId = comment.id; // Add data attribute for main comment ID
                commentElement.innerHTML = `
                    <div class="user-info">
                        <div class="avatar">
                            <img src="images/profilePic2" alt="User Avatar">
                        </div>
                        <div class="username">${formattedUsername}</div>
                    </div>
                    <div class="post-content">${comment.content}</div>
                    <p class="comment-date">Posted on: ${new Date(comment.created_at).toLocaleDateString()}</p>
                    <div class="post-actions">
                        <span class="likes">👍 13 Likes</span> 
                        <span class="dislikes">👎 100 Dislike</span>
                        <span class="comment-action">🌤️ Comment</span>
                    </div>
                `;
                mainPost.appendChild(commentElement);
            } else {
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
            }
        });
    }

    function formatUsername(username) {
        return username.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    fetchComments();

    window.saveComment = saveComment;
    window.closePopup = closePopup;
});
