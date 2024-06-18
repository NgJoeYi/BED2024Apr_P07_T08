document.addEventListener('DOMContentLoaded', () => {
    const addCommentBtn = document.getElementById('addCommentBtn');
    const closePopupBtn = document.querySelector('.popup .close');
    const popup = document.getElementById('popup');
    let editMode = false;
    let currentComment = null;
  
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
  
    // Attach event listeners to existing comments
    document.querySelectorAll('.comment').forEach(comment => {
        comment.querySelector('.delete-btn').addEventListener('click', () => {
            deleteComment(comment.querySelector('.delete-btn'));
        });
  
        comment.querySelector('.edit-btn').addEventListener('click', () => {
            editComment(comment.querySelector('.edit-btn'));
        });
    });
  });
  