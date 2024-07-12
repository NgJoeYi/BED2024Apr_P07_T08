document.addEventListener('DOMContentLoaded', function () {
    fetchDiscussions();

    // Add event listeners for filter and sort options
    document.getElementById('filter-category').addEventListener('change', fetchDiscussions);
    document.getElementById('sort-date').addEventListener('change', fetchDiscussions);
    document.querySelector('.refresh-button').addEventListener('click', fetchDiscussions);
    document.getElementById('clear-search').addEventListener('click', clearSearch);

    // Form submission handler to add a discussion
    document.getElementById('addDiscussionForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const token = getToken(); // Function to get the current user's ID

        if (!token) {
            alert('User must be logged in to submit a discussion.');
            return;
        }

        const data = {
            title: title,
            category: category,
            description: description
        };

        console.log('Submitting form with data:', data);
        displayLoading(true);

        fetch('/discussions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            console.log('Server response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Server response data:', data);
            if (data.success) {
                addDiscussionToFeed(data.discussion);
                closePopup();
                document.getElementById('addDiscussionForm').reset(); // Clear form fields
            } else {
                console.error('Error submitting discussion:', data);
                alert('Error submitting discussion: ' + (data.errors ? data.errors.map(e => e.msg).join(', ') : 'Unknown error'));
            }
            displayLoading(false);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error adding discussion.');
            displayLoading(false);
        });
    });
});

function getToken() {
    const token = sessionStorage.getItem('token');
    if (!token) {
        alert('User is not logged in or session has expired');
        return null;
    }
    return token;
}

function fetchDiscussions() {
    const category = document.getElementById('filter-category').value;
    const sort = document.getElementById('sort-date').value;
    const searchQuery = document.getElementById('search-input').value;

    displayLoading(true);

    fetch(`/discussions?category=${category}&sort=${sort}&search=${searchQuery}`)
        .then(response => response.json())
        .then(data => {
            const feed = document.querySelector('.activity-feed');
            feed.innerHTML = ''; // Clear the feed

            if (data.success) {
                if (data.discussions.length === 0) {
                    // Display "No discussion found" message
                    const noDiscussionMessage = document.createElement('div');
                    noDiscussionMessage.classList.add('no-discussion-message');
                    noDiscussionMessage.textContent = "No discussion found";
                    feed.appendChild(noDiscussionMessage);
                } else {
                    data.discussions.forEach(discussion => {
                        addDiscussionToFeed(discussion);
                    });
                }
            } else {
                console.error('Error fetching discussions:', data.error);
                alert('Error fetching discussions.');
            }
            displayLoading(false);
        })
        .catch(error => {
            console.error('Network or server error:', error);
            alert('Error fetching discussions.');
            displayLoading(false);
        });
}

function clearSearch() {
    document.getElementById('search-input').value = '';
    fetchDiscussions();
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function addDiscussionToFeed(discussion) {
    console.log(discussion); // Add this line to debug

    const feed = document.querySelector('.activity-feed');
    const post = document.createElement('div');
    post.classList.add('post');
    post.setAttribute('data-id', discussion.id);

    const likedByUser = discussion.userLiked ? 'true' : 'false';
    const dislikedByUser = discussion.userDisliked ? 'true' : 'false';

    const likesText = `👍 ${discussion.likes} Likes`;
    const dislikesText = `👎 ${discussion.dislikes} Dislikes`;

    // Capitalize the first letter of the username
    const capitalizedUsername = capitalizeFirstLetter(discussion.username);

    // Check if profilePic is available, otherwise use default profile picture
    const profilePicUrl = discussion.profilePic || 'images/profilePic.jpeg';

    post.innerHTML = `
        <div class="post-header">
            <div class="profile-pic">
                <img src="${profilePicUrl}" alt="Profile Picture">
            </div>
            <div class="username">${capitalizedUsername}</div>
            <div class="role">(${discussion.role})</div> <!-- Display the role -->
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
                <span id="comment-count-${discussion.id}" class="comment-count" style="margin-left: -2px;">💬 0 Comments</span>
            </div>
            <button class="comment-button" data-id="${discussion.id}">Go to Comment</button>
        </div>
    `;

    feed.prepend(post);

    // Fetch and display the comment count for each discussion
    fetchCommentCountForDiscussion(discussion.id);

    // Attach event listeners after appending to the feed to ensure they are correctly set up
    const likeButton = post.querySelector('.like-button');
    const dislikeButton = post.querySelector('.dislike-button');
    const commentButton = post.querySelector('.comment-button');

    likeButton.addEventListener('click', function () {
        if (this.getAttribute('data-liked') === 'false') {
            console.log('Like button clicked');
            incrementLikes(discussion.id, this, dislikeButton);
        }
    });

    dislikeButton.addEventListener('click', function () {
        if (this.getAttribute('data-disliked') === 'false') {
            console.log('Dislike button clicked');
            incrementDislikes(discussion.id, likeButton, this);
        }
    });

    commentButton.addEventListener('click', function () {
        const discussionId = this.getAttribute('data-id');
        window.location.href = `comment.html?discussionId=${discussionId}`;
    });
}

function fetchCommentCountForDiscussion(discussionId) {
    fetch(`/comments/count?discussionId=${discussionId}`)
        .then(response => response.json())
        .then(data => {
            if (data.count !== undefined) {
                const commentCountElement = document.getElementById(`comment-count-${discussionId}`);
                commentCountElement.textContent = `💬 ${data.count} Comments`;
            } else {
                console.error('Error fetching comment count for discussion:', data);
                alert('Error fetching comment count.');
            }
        })
        .catch(error => {
            console.error('Network or server error:', error);
            alert('Error fetching comment count.');
        });
}

function incrementLikes(discussionId, likeButton, dislikeButton) {
    const token = getToken();
    if (!token) {
        return;
    }
    
    if (likeButton.getAttribute('data-liked') === 'true') {
        alert('You have already liked this discussion.');
        return;
    }

    fetch(`/discussions/${discussionId}/like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            likeButton.textContent = `👍 ${data.likes} Likes`;
            likeButton.setAttribute('data-liked', 'true');
            dislikeButton.setAttribute('data-disliked', 'false');
        } else {
            alert('Error adding like.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error adding like.');
    });
}

function incrementDislikes(discussionId, likeButton, dislikeButton) {
    const token = getToken();
    if (!token) {
        return;
    }

    if (dislikeButton.getAttribute('data-disliked') === 'true') {
        alert('You have already disliked this discussion.');
        return;
    }

    fetch(`/discussions/${discussionId}/dislike`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            dislikeButton.textContent = `👎 ${data.dislikes} Dislikes`;
            dislikeButton.setAttribute('data-disliked', 'true');
            likeButton.setAttribute('data-liked', 'false');
        } else {
            alert('Error adding dislike.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error adding dislike.');
    });
}

// Define the popup functions
function openPopup() {
    document.getElementById("popup").style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

// Close the popup when clicking outside the popup content
window.onclick = function(event) {
    if (event.target == document.getElementById("popup")) {
        document.getElementById("popup").style.display = "none";
    }
}

// Helper function to show/hide loading indicator
function displayLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}
