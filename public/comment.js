document.addEventListener('DOMContentLoaded', () => {
    const addCommentBtn = document.getElementById('addCommentBtn');
    const popup = document.getElementById('popup');
    const closePopupBtn = document.querySelector('.popup .close');
    let editMode = false;
    let currentComment = null;

    addCommentBtn.addEventListener('click', () => {
        // Show your comment popup or perform any relevant action
        popup.style.display = 'flex'; // Example to show a popup
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
        } else {
            popupTitle.textContent = 'Edit Comment';
            commentText.value = currentComment.querySelector('.comment-content').textContent.trim();
            editMode = true;
        }
        
        popup.style.display = 'flex';
    }

    function closePopup() {
        popup.style.display = 'none';
    }

    function saveComment() {
        const commentText = document.getElementById('comment-text').value;
        if (commentText) {
            if (editMode && currentComment) {
                currentComment.querySelector('.comment-content').textContent = commentText;
            } else {
                addNewComment(commentText);
            }
            closePopup();
        }
    }

    function addNewComment(text) {
        const commentsSection = document.querySelector('.comments-section');
        const newComment = document.createElement('div');
        newComment.classList.add('comment');
        newComment.innerHTML = `
            <div class="user-info">
                <div class="avatar"></div>
                <div class="username">Bot</div>
            </div>
            <div class="comment-content">${text}</div>
            <div class="comment-actions">
                <button class="delete-btn btn" onclick="deleteComment(this)">Delete</button>
                <button class="edit-btn btn" onclick="editComment(this)">Edit</button>
            </div>
        `;
        commentsSection.appendChild(newComment);
    }

    window.deleteComment = function(button) {
        const comment = button.closest('.comment');
        if (confirm("Are you sure you want to delete this comment?")) {
            comment.remove();
        }
    };

    window.editComment = function(button) {
        currentComment = button.closest('.comment');
        showPopup('edit');
    };

    // Fetch and display comments
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
        mainPost.innerHTML = ''; // Clear existing main post
        commentsSection.innerHTML = ''; // Clear existing comments
        
        comments.forEach(comment => {
            const formattedUsername = formatUsername(comment.username);
            const commentElement = document.createElement('div');
            
            if (comment.parent_comment_id === null) {
                commentElement.classList.add('post');
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

    fetchComments(); // Load comments when the page loads
});

