document.addEventListener('DOMContentLoaded', () => {

    const popup = document.getElementById('popup'); 
    const addCommentBtn = document.getElementById('addCommentBtn'); 

    let editMode = false; 
    let currentComment = null;
    let currentCommentId = null;

    const token = getToken();
    const currentUserId = parseInt(sessionStorage.getItem('userId'), 10);  
    const currentUser = { 
        profilePic: sessionStorage.getItem('profilePic') || 'images/profilePic.jpeg'
    };

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
        const cancelButton = popup.querySelector('.cancel-btn');
        const avatarImg = popup.querySelector('.avatar img');

        if (type === 'add') {
            popupTitle.textContent = 'Leave a Comment';
            commentText.value = ''; 
            avatarImg.src = currentUser.profilePic;  
            editMode = false;
            currentComment = null; 
            currentCommentId = null; 
            saveButton.onclick = saveComment;

        } else {
            popupTitle.textContent = 'Edit Comment';
            commentText.value = currentComment.querySelector('.comment-content').textContent.trim(); 
            avatarImg.src = currentComment.querySelector('.avatar img').src; 
            editMode = true;
            saveButton.onclick = saveComment;  
        }

        cancelButton.onclick = closePopup; 
        popup.style.display = 'flex';
    }

    function closePopup() {
        popup.style.display = 'none';
    }

    async function saveComment() {
        const commentText = document.getElementById('comment-text').value;
        const discussionId = new URLSearchParams(window.location.search).get('discussionId');
    
        try {
            const response = editMode && currentComment
                ? await fetchWithAuth(`/comments/${currentCommentId}`, { 
                    method: 'PUT',
                    body: JSON.stringify({ content: commentText, discussionId: parseInt(discussionId, 10) })
                })
                : await fetchWithAuth('/comments', { 
                    method: 'POST',
                    body: JSON.stringify({ content: commentText, discussionId: parseInt(discussionId, 10) })
                });
    
            if (response.ok) { 
                const updatedComment = await response.json();
                if (editMode && currentComment) {
                    currentComment.querySelector('.comment-content').textContent = commentText;

                    // Remove existing translation elements
                    currentComment.querySelector('.comment-translated-content')?.remove();
                    currentComment.querySelector('.comment-source-language')?.remove();

                    // Create new translation HTML if necessary
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
                    fetchComments(discussionId);
                }
                closePopup();
            } else {
                const errorData = await response.json();
                alert(errorData.error || response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }    

    async function postComment(text, discussionId) {
        try {
            const response = await fetchWithAuth('/comments', { 
                method: 'POST',
                body: JSON.stringify({ content: text, discussionId: parseInt(discussionId, 10) })
            });
            if (response.ok) { 
                alert('Comment posted successfully!');
                fetchComments(discussionId); 
            } else {
                const errorData = await response.json(); 
                alert(errorData.error || response.statusText); 
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
        const comment = button.closest('.comment');
        const commentUserId = parseInt(comment.dataset.userId, 10);
        const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); 
        
        if (commentUserId === currentUserId) {
            currentComment = comment; 
            currentCommentId = comment.dataset.id;
            showPopup('edit');
        } else {
            alert('You can only edit your own comments.');
        }
    }
        
   

    document.addEventListener('DOMContentLoaded', function () {
        const urlParams = new URLSearchParams(window.location.search);
        const discussionId = urlParams.get('discussionId');
        fetchDiscussionDetails(discussionId);
    });
    
    async function fetchDiscussionDetails(discussionId) {
        try {
            const response = await fetchWithAuth(`/discussions/${discussionId}`);
            if (!response.ok) {
                throw new Error(`Error fetching discussion: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.success) {
                console.log('Fetched discussion data:', data.discussion);
                displayDiscussionDetails(data.discussion);
            } else {
                console.error('Error fetching discussion:', data.error);
            }
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
        const likedByUser = discussion.userLiked; 
        const dislikedByUser = discussion.userDisliked; 
    
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
                    <button class="like-button" style="color: black;" data-liked="${likedByUser}">${likesText}</button>
                    <button class="dislike-button" style="color: black;" data-disliked="${dislikedByUser}">${dislikesText}</button>
                </div>
            </div>
        `;
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

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
            const userId = sessionStorage.getItem('userId'); // Assuming userId is stored in sessionStorage
            if (!userId) {
                alert('User ID is required');
                return;
            }
    
            const response = await fetchWithAuth(`/comments/${commentId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }) // Include userId in the request body
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
    
    async function incrementDislikes(commentId, likeButton, dislikeButton) {
        try {
            const userId = sessionStorage.getItem('userId'); // Assuming userId is stored in sessionStorage
            if (!userId) {
                alert('User ID is required');
                return;
            }
    
            const response = await fetchWithAuth(`/comments/${commentId}/dislike`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }) // Include userId in the request body
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
             
    function displayComments(comments) {
        const commentsSection = document.querySelector('.comments-section'); 
        commentsSection.innerHTML = ''; 
        const token = getToken();
        const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); 

        comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
        comments.forEach(comment => { 
            console.log(comment); 
    
            const formattedUsername = formatUsername(comment.username);
            const commentElement = document.createElement('div'); 
            commentElement.classList.add('comment');
            commentElement.dataset.id = comment.id;
            commentElement.dataset.userId = comment.user_id;

            const likedByUser = comment.userLiked ? 'true' : 'false';
            const dislikedByUser = comment.userDisliked ? 'true' : 'false';

            const likesText = `👍 ${comment.likes || 0} Likes`;
            const dislikesText = `👎 ${comment.dislikes || 0} Dislikes`;

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

            likeButton.addEventListener('click', function () {
                if (dislikeButton.getAttribute('data-disliked') === 'true') {
                    alert('You can only like or dislike a comment.');
                    return;
                }
                incrementLikes(comment.id, this, dislikeButton); 
            });

            dislikeButton.addEventListener('click', function () {
                if (likeButton.getAttribute('data-liked') === 'true') {
                    alert('You can only like or dislike a comment.');
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

    const discussionId = new URLSearchParams(window.location.search).get('discussionId'); 
    fetchDiscussionDetails(discussionId);
    fetchComments(discussionId); 
    fetchCommentCountByDiscussionId(discussionId);

    window.editComment = editComment;
    window.deleteComment = deleteComment;
    window.saveComment = saveComment;
    window.closePopup = closePopup;
});

function getToken() {
    return sessionStorage.getItem('token'); 
}
