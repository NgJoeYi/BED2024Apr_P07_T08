document.addEventListener('DOMContentLoaded', function () {
    fetchDiscussions();
    // Add event listeners for filter and sort options
    document.getElementById('filter-category').addEventListener('change', fetchDiscussions);
    document.getElementById('sort-date').addEventListener('change', fetchDiscussions);
    // Form submission handler to add a discussion
    document.getElementById('addDiscussionForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const userId = getCurrentUserId(); // Implement this function to get the current user's ID

        const data = {
            title: title,
            category: category,
            description: description,
            userId: userId
        };

        fetch('/discussions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                addDiscussionToFeed(data.discussion);
                closePopup();
            } else {
                alert('Error adding discussion.');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    function getCurrentUserId() {
        // Implement the logic to get the current user's ID.
        // This might be from a global variable set during login or from a cookie/session storage.
        return sessionStorage.getItem('userId');
    }
});

function fetchDiscussions() {
    const category = document.getElementById('filter-category').value;
    const sort = document.getElementById('sort-date').value;

    fetch(`/discussions?category=${category}&sort=${sort}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const feed = document.querySelector('.activity-feed');
                feed.innerHTML = ''; // Clear the feed
                data.discussions.forEach(discussion => {
                    addDiscussionToFeed(discussion);
                });
            } else {
                console.error('Error response from server:', data.error);
                alert('Error fetching discussions.');
            }
        })
        .catch(error => {
            console.error('Network or server error:', error);
            alert('Error fetching discussions.');
        });
}

function addDiscussionToFeed(discussion) {
    const feed = document.querySelector('.activity-feed');
    const post = document.createElement('div');
    post.classList.add('post');
    post.setAttribute('data-id', discussion.id);

    const likesText = `👍 ${discussion.likes} Likes`;
    const dislikesText = `👎 ${discussion.dislikes} Dislikes`;

    post.innerHTML = `
        <div class="post-header">
            <div class="profile-pic">
                <img src="${discussion.profilePic || 'profilePic.jpeg'}" alt="Profile Picture">
            </div>
            <div class="username">${discussion.username}</div>
        </div>
        <div class="post-meta">
            <span class="category">Category: ${discussion.category}</span>
            <span class="posted-date-activity">Posted on: ${new Date(discussion.posted_date).toLocaleDateString()}</span>
        </div>
        <div class="post-content">
            <p>${discussion.description}</p>
        </div>
        <div class="post-footer">
            <div class="likes-dislikes">
                <button class="like-button" data-liked="false">${likesText}</button>
                <button class="dislike-button" data-disliked="false">${dislikesText}</button>
            </div>
            <button class="comment-button">Go to Comment</button>
        </div>
    `;

    feed.prepend(post);

    const likeButton = post.querySelector('.like-button');
    const dislikeButton = post.querySelector('.dislike-button');

    likeButton.addEventListener('click', () => {
        if (likeButton.getAttribute('data-liked') === 'false') {
            incrementLikes(discussion.id, post, likeButton, dislikeButton);
        }
    });

    dislikeButton.addEventListener('click', () => {
        if (dislikeButton.getAttribute('data-disliked') === 'false') {
            incrementDislikes(discussion.id, post, likeButton, dislikeButton);
        }
    });
}

function incrementLikes(discussionId, post, likeButton, dislikeButton) {
    fetch('/discussions/like', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ discussionId: discussionId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const likesText = `👍 ${data.likes} Likes`;
            likeButton.textContent = likesText;
            likeButton.setAttribute('data-liked', 'true');
            dislikeButton.setAttribute('data-disliked', 'true'); // Prevent disliking if liked
        } else {
            alert('Error liking discussion.');
        }
    })
    .catch(error => console.error('Error:', error));
}

function incrementDislikes(discussionId, post, likeButton, dislikeButton) {
    fetch('/discussions/dislike', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ discussionId: discussionId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const dislikesText = `👎 ${data.dislikes} Dislikes`;
            dislikeButton.textContent = dislikesText;
            dislikeButton.setAttribute('data-disliked', 'true');
            likeButton.setAttribute('data-liked', 'true'); // Prevent liking if disliked
        } else {
            alert('Error disliking discussion.');
        }
    })
    .catch(error => console.error('Error:', error));
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
