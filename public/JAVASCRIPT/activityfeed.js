document.addEventListener('DOMContentLoaded', function () {
    const token = getToken(); // Retrieve the token from sessionStorage
    const currentUserId = getCurrentUserId(); // Retrieve the user ID from sessionStorage

    // Set the Main Feed tab as the default active tab
    showTab('mainFeed');

    // Add event listeners for filter and sort options
    document.getElementById('filter-category').addEventListener('change', () => fetchDiscussions(getActiveTab()));
    document.getElementById('sort-date').addEventListener('change', () => fetchDiscussions(getActiveTab()));
    document.querySelector('.refresh-button').addEventListener('click', () => fetchDiscussions(getActiveTab()));
    document.getElementById('clear-search').addEventListener('click', clearSearch);

    // Form submission handler to add a discussion
    document.getElementById('addDiscussionForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;

        const data = {
            title: title,
            category: category,
            description: description
        };

        console.log('Submitting form with data:', data);
        displayLoading(true);

        fetchWithAuth('/discussions', {
            method: 'POST',
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server response data:', data);
            if (data.success) {
                addDiscussionToFeed(data.discussion, 'mainFeed');
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
    console.log('getToken called, token:', token); // Debugging line
    return token;
}

function getCurrentUserId() {
    return parseInt(sessionStorage.getItem('userId'), 10);
}

function fetchDiscussions(feedType = 'mainFeed') {
    const category = document.getElementById('filter-category').value;
    const sort = document.getElementById('sort-date').value;
    const searchQuery = document.getElementById('search-input').value;

    displayLoading(true);

    let url = `/discussions?category=${category}&sort=${sort}&search=${searchQuery}`;
    if (feedType === 'following') {
        fetchFollowedDiscussions();
        return;
    }

    fetch(url, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        const feed = document.querySelector(`#${feedType} .activity-feed`);
        if (!feed) {
            console.error(`No element found with selector: #${feedType} .activity-feed`);
            return;
        }
        feed.innerHTML = ''; // Clear the feed

        if (data.success) {
            if (data.discussions.length === 0) {
                const noDiscussionMessage = document.createElement('div');
                noDiscussionMessage.classList.add('no-discussion-message');
                noDiscussionMessage.textContent = "No discussions found";
                feed.appendChild(noDiscussionMessage);
            } else {
                data.discussions.forEach(discussion => {
                    addDiscussionToFeed(discussion, feedType);
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

function fetchFollowedDiscussions() {
    displayLoading(true);

    fetchWithAuth('/followed-discussions', {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        const feed = document.querySelector('#following .activity-feed');
        if (!feed) {
            console.error(`No element found with selector: #following .activity-feed`);
            return;
        }
        feed.innerHTML = ''; // Clear the feed

        if (data.success) {
            if (data.discussions.length === 0) {
                const noDiscussionMessage = document.createElement('div');
                noDiscussionMessage.classList.add('no-suggestion');
                noDiscussionMessage.textContent = "No discussions found";
                feed.appendChild(noDiscussionMessage);
            } else {
                data.discussions.forEach(discussion => {
                    addDiscussionToFeed(discussion, 'following');
                });
            }
        } else {
            console.error('Error fetching followed discussions:', data.error);
            alert('Error fetching followed discussions.');
        }
        displayLoading(false);
    })
    .catch(error => {
        console.error('Network or server error:', error);
        alert('Error fetching followed discussions.');
        displayLoading(false);
    });
}

function clearSearch() {
    document.getElementById('search-input').value = '';
    fetchDiscussions(getActiveTab());
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function addDiscussionToFeed(discussion, feedType) {
    const feed = document.querySelector(`#${feedType} .activity-feed`);
    if (!feed) {
        console.error(`Feed element not found for feed type: ${feedType}`);
        return;
    }

    const post = document.createElement('div');
    post.classList.add('post');
    post.setAttribute('data-id', discussion.id);
    post.setAttribute('data-user-id', discussion.user_id);

    const likedByUser = discussion.userLiked ? 'true' : 'false';
    const dislikedByUser = discussion.userDisliked ? 'true' : 'false';

    const likesText = `👍 ${discussion.likes} Likes`;
    const dislikesText = `👎 ${discussion.dislikes} Dislikes`;
    const viewsText = `👁️ ${discussion.views} Views`;

    const capitalizedUsername = capitalizeFirstLetter(discussion.username);
    const profilePicUrl = discussion.profilePic || 'images/profilePic.jpeg';

    post.innerHTML = `
        <div class="post-header">
            <div class="profile-pic">
                <img src="${profilePicUrl}" alt="Profile Picture">
            </div>
            <div class="user-info">
                <div class="username">${capitalizedUsername}</div>
                <div class="role">(${discussion.role})</div>
                <button class="follow-button ${discussion.isFollowing ? 'unfollow-button' : 'follow-button'}" data-user-id="${discussion.user_id}">
                    ${discussion.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
            </div>
             <div class="button-container">
                    <button class="suggestion-button" data-id="${discussion.id}">💡</button>
                    <button class="pin-button" data-id="${discussion.id}">${discussion.pinned ? 'Unpin' : 'Pin'}</button> <!-- Button for pin/unpin -->
            </div>
        </div>
        <div class="post-meta">
            <span class="posted-date-activity-dis">${new Date(discussion.posted_date).toLocaleDateString()}</span>
        </div>
        <div class="post-content-dis">
            <h3>${discussion.title}</h3>
            <p>${discussion.description}</p>
        </div>
        <div class="post-footer">
            <div class="likes-dislikes">
                <button class="like-button" data-liked="${likedByUser}">${likesText}</button>
                <button class="dislike-button" data-disliked="${dislikedByUser}">${dislikesText}</button>
                <span id="comment-count-${discussion.id}" class="comment-count">💬 0 Comments</span>
                <span class="views-count">${viewsText}</span>
            </div>
            <button class="comment-button" data-id="${discussion.id}">Go to Comment</button>
           
        </div>
    `;

    if (discussion.pinned) {
        feed.prepend(post);
    } else {
        feed.appendChild(post);
    }

    fetchCommentCountForDiscussion(discussion.id);

    const likeButton = post.querySelector('.like-button');
    const dislikeButton = post.querySelector('.dislike-button');
    const commentButton = post.querySelector('.comment-button');
    const followButton = post.querySelector('.follow-button');
    const suggestionButton = post.querySelector('.suggestion-button'); // Get the suggestion button
    const pinButton = post.querySelector('.pin-button'); // Get the pin/unpin button

    if (discussion.user_id === getCurrentUserId()) {
        followButton.style.display = 'none'; // Hide follow button for discussions posted by the logged-in user
    }

    likeButton.addEventListener('click', function () {
        if (this.getAttribute('data-liked') === 'true') {
            alert('You have already liked this discussion.');
            return;
        }
        incrementLikes(discussion.id, this, dislikeButton);
        incrementViews(discussion.id);
    });

    dislikeButton.addEventListener('click', function () {
        if (this.getAttribute('data-disliked') === 'true') {
            alert('You have already disliked this discussion.');
            return;
        }
        incrementDislikes(discussion.id, likeButton, this);
        incrementViews(discussion.id);
    });

    commentButton.addEventListener('click', function () {
        const discussionId = this.getAttribute('data-id');
        incrementViews(discussionId);
        window.location.href = `comment.html?discussionId=${discussionId}`;
    });

    followButton.addEventListener('click', function () {
        const followeeId = post.getAttribute('data-user-id');
        if (this.textContent === 'Follow') {
            console.log('Following user:', followeeId); // Debugging line
            followUser(followeeId, this);
        } else {
            console.log('Unfollowing user:', followeeId); // Debugging line
            unfollowUser(followeeId, this);
        }
    });

    // Add event listener to suggestion button
    suggestionButton.addEventListener('click', function () {
        const discussionId = this.getAttribute('data-id');
        showSuggestionsPopup(discussionId);
    });

    // Add event listener to pin/unpin button
    pinButton.addEventListener('click', function () {
        const discussionId = this.getAttribute('data-id');
        const action = this.textContent.toLowerCase() === 'pin' ? 'pin' : 'unpin';
        togglePinDiscussion(discussionId, action, this);
    });
}


function incrementViews(discussionId) {
    fetchWithAuth(`/discussions/${discussionId}/view`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log(`Views incremented for discussion ${discussionId}. Current views: ${data.views}`);
        } else {
            console.error('Error incrementing views:', data.error);
        }
    })
    .catch(error => {
        console.error('Error incrementing views:', error);
    });
}

function incrementLikes(discussionId, likeButton, dislikeButton) {
    fetchWithAuth(`/discussions/${discussionId}/like`, {
        method: 'POST'
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
    if (dislikeButton.getAttribute('data-disliked') === 'true') {
        alert('You have already disliked this discussion.');
        return;
    }

    fetchWithAuth(`/discussions/${discussionId}/dislike`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
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
        console.error('Error adding dislike:', error);
        alert('Error adding dislike.');
    });
}

function fetchCommentCountForDiscussion(discussionId) {
    console.log(`Fetching comment count for discussion ID: ${discussionId}`);
    fetch(`/comments/discussion/${discussionId}/count`)
        .then(response => {
            console.log(`Response received for discussion ID: ${discussionId}`);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Data received for discussion ID: ${discussionId}:`, data);
            if (data.count !== undefined) {
                const commentCountElement = document.getElementById(`comment-count-${discussionId}`);
                if (commentCountElement) {
                    commentCountElement.textContent = `💬 ${data.count} Comments`;
                    console.log(`Updated comment count for discussion ID: ${discussionId}`);
                } else {
                    console.error(`Comment count element not found for discussion ID: ${discussionId}`);
                }
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

function displayLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

function openPopup() {
    document.getElementById("popup").style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

window.onclick = function(event) {
    if (event.target == document.getElementById("popup")) {
        document.getElementById("popup").style.display = "none";
    }
}

function togglePinDiscussion(discussionId, action, button) {
    fetchWithAuth(`/discussions/${discussionId}/${action}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            fetchDiscussions(getActiveTab()); // Refresh the discussions list to reflect the change
        } else {
            alert('Error pinning/unpinning discussion.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert(`Network error: ${error.message}`);
    });
}

function followUser(followeeId, button) {
    const followeeIdNum = parseInt(followeeId, 10);
    if (isNaN(followeeIdNum)) {
        console.error('Invalid followeeId:', followeeId);
        alert('Invalid followee ID.');
        return;
    }

    console.log('Attempting to follow user ID:', followeeIdNum); // Debugging log

    fetchWithAuth('/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followeeId: followeeIdNum })
    })
    .then(response => {
        if (!response.ok) {
            console.error('Failed to follow user, status:', response.status);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Follow response data:', data); // Debugging log
        if (data.success) {
            button.textContent = 'Unfollow';
            button.classList.remove('follow-button');
            button.classList.add('unfollow-button');
            alert('Successfully followed the user.'); // Alert for success
            console.log(`Updated follow status for user ID: ${followeeIdNum} to 'Unfollow'`);
        } else {
            alert('Error following user.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while trying to follow the user.');
    });
}

function unfollowUser(followeeId, button) {
    const followeeIdNum = parseInt(followeeId, 10);
    if (isNaN(followeeIdNum)) {
        console.error('Invalid followeeId:', followeeId);
        alert('Invalid followee ID.');
        return;
    }

    console.log('Attempting to unfollow user ID:', followeeIdNum); // Debugging log

    fetchWithAuth('/unfollow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followeeId: followeeIdNum })
    })
    .then(response => {
        if (!response.ok) {
            console.error('Failed to unfollow user, status:', response.status);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Unfollow response data:', data); // Debugging log
        if (data.success) {
            button.textContent = 'Follow';
            button.classList.remove('unfollow-button');
            button.classList.add('follow-button');
            alert('Successfully unfollowed the user.'); // Alert for success
            console.log(`Updated follow status for user ID: ${followeeIdNum} to 'Follow'`);
            if (getActiveTab() === 'following') {
                const postElement = button.closest('.post');
                if (postElement) {
                    postElement.remove();
                }
            }
        } else {
            alert('Error unfollowing user.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while trying to unfollow the user.');
    });
}

function showTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');

    document.querySelector(`#${tabName}`).style.display = 'block';
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');

    fetchDiscussions(tabName);
}

function getActiveTab() {
    const activeTab = document.querySelector('.tab-btn.active');
    return activeTab ? activeTab.getAttribute('onclick').match(/showTab\('([^']+)'\)/)[1] : 'mainFeed';
}

function checkFollowStatus(followeeId) {
    return fetchWithAuth(`/follow-status?followeeId=${followeeId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            return data.following;
        } else {
            throw new Error('Error checking follow status');
        }
    })
    .catch(error => {
        console.error('Error checking follow status:', error);
        throw error;
    });
}

// for GEMINI API
// Add this JavaScript to your script file
async function showSuggestionsPopup(discussionId) {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('No token provided');
        }

        // Fetch suggestions from the server
        const response = await fetch(`/discussions/${discussionId}/suggestions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            let suggestions = data.suggestions;

            // Ensure suggestions is an array or convert it to an array
            if (!Array.isArray(suggestions)) {
                suggestions = [suggestions];
            }

            const suggestionsContainer = document.getElementById('suggestionsContainer');
            suggestionsContainer.innerHTML = ''; // Clear previous suggestions

            if (suggestions.length > 0) {
                suggestions.forEach(suggestion => {
                    const suggestionElement = document.createElement('div');
                    suggestionElement.classList.add('suggestion');
                    suggestionElement.innerText = suggestion;
                    suggestionsContainer.appendChild(suggestionElement);
                });
            } else {
                const noSuggestionElement = document.createElement('div');
                noSuggestionElement.classList.add('no-suggestion');
                noSuggestionElement.innerText = 'No suggestions available.';
                suggestionsContainer.appendChild(noSuggestionElement);
            }

            // Show the popup
            document.getElementById('suggestionPopup').style.display = 'block';
        } else {
            console.error('Error fetching suggestions:', data.error);
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

function closeSuggestionPopup() {
    document.getElementById('suggestionPopup').style.display = 'none';
}
