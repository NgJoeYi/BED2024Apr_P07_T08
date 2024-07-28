
// -------------------------------------------------------------------------------this is for declaring the token from session storage----------------------------------

function getToken() {
    const token = sessionStorage.getItem('token');
    console.log('getToken called, token:', token); // Debugging line
    return token;
}

function getCurrentUserId() {
    return parseInt(sessionStorage.getItem('userId'), 10);
}

//-------------------------------------------------------------------------------------this will run after the entire html document has been parsed-------------------------------------

// Add an event listener that triggers when the DOM content is fully loaded - the script runs only after the entire HTML document has been parsed.
document.addEventListener('DOMContentLoaded', function () {
    const token = getToken(); // Retrieve the token from sessionStorage
    const currentUserId = getCurrentUserId(); // Retrieve the user ID from sessionStorage

    // Set the Main Feed tab as the default active tab
    showTab('mainFeed');

    // Add event listeners for filter and sort options
    //When the filter category or sort date changes, or the refresh button is clicked, the fetchDiscussions function is called for the currently active tab.
    document.getElementById('filter-category').addEventListener('change', () => fetchDiscussions(getActiveTab()));
    document.getElementById('sort-date').addEventListener('change', () => fetchDiscussions(getActiveTab()));
    document.querySelector('.refresh-button').addEventListener('click', () => fetchDiscussions(getActiveTab()));
    document.getElementById('clear-search').addEventListener('click', clearSearch);

    // Form submission handler to add a discussion
    document.getElementById('addDiscussionForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        // Retrieve values from the form inputs
        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;

        // Create a data object to be sent to the server
        const data = {
            title: title,
            category: category,
            description: description
        };

        console.log('Submitting form with data:', data); // Log the data being submitted
        displayLoading(true); // Show a loading indicator

        // Send the form data to the server
        fetchWithAuth('/discussions', {
            method: 'POST',
            body: JSON.stringify(data) // Convert the data object to a JSON string
        })
        .then(response => response.json()) // Parse the JSON response
        .then(data => {
            console.log('Server response data:', data); // Log the server response
            if (data.success) {
                addDiscussionToFeed(data.discussion, 'mainFeed'); // Add the new discussion to the main feed
                closePopup(); // Close the popup form
                document.getElementById('addDiscussionForm').reset(); // Clear the form fields
            } else {
                console.error('Error submitting discussion:', data); // Log any errors
                alert('Error submitting discussion: ' + (data.errors ? data.errors.map(e => e.msg).join(', ') : 'Unknown error')); // Display an alert with the error message
            }
            displayLoading(false); // Hide the loading indicator
        })
        .catch(error => {
            console.error('Error:', error); // Log any errors
            alert('Error adding discussion.'); // Display an alert with the error message
            displayLoading(false); // Hide the loading indicator
        });
    });
});

// ----------------------------------------------------------Fetching of Main Feed Discussion-------------------------------------------------------------------------------
// Function to fetch discussions based on the feed type
function fetchDiscussions(feedType = 'mainFeed') {
    // Retrieve filter and sort options from the form
    const category = document.getElementById('filter-category').value;
    const sort = document.getElementById('sort-date').value;
    const searchQuery = document.getElementById('search-input').value;

    // Show loading indicator
    displayLoading(true);

    // Construct the URL with query parameters for category, sort, and search
    let url = `/discussions?category=${category}&sort=${sort}&search=${searchQuery}`;

    // If the feed type is 'following', fetch followed discussions instead
    if (feedType === 'following') {
        fetchFollowedDiscussions();
        return;
    }

    // Fetch discussions from the server using the constructed URL
    fetch(url, {
        method: 'GET'
    })
    .then(response => {
        // Check if the response is not okay (status is not in the range 200-299)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        // Parse the JSON response body
        return response.json();
    })
    .then(data => {
        // Find the feed element based on the feed type
        const feed = document.querySelector(`#${feedType} .activity-feed`);
        if (!feed) {
            console.error(`No element found with selector: #${feedType} .activity-feed`);
            return;
        }
        // Clear the feed content
        feed.innerHTML = '';

        // Check if the server response indicates success
        if (data.success) {
            // If no discussions are found, display a message
            if (data.discussions.length === 0) {
                const noDiscussionMessage = document.createElement('div');
                noDiscussionMessage.classList.add('no-discussion-message');
                noDiscussionMessage.textContent = "No discussions found";
                feed.appendChild(noDiscussionMessage);
            } else {
                // Otherwise, add each discussion to the feed
                data.discussions.forEach(discussion => {
                    addDiscussionToFeed(discussion, feedType);
                });
            }
        } else {
            console.error('Error fetching discussions:', data.error);
            alert('Error fetching discussions.');
        }
        // Hide loading indicator
        displayLoading(false);
    })
    .catch(error => {
        // Handle network or server errors
        console.error('Network or server error:', error);
        alert('Error fetching discussions.');
        displayLoading(false); // Hide loading indicator
    });
}

// -----------------------------------------------------------fetching of followed discussion in following tab-----------------------------------------------------

// Function to fetch discussions from users that the current user follows
function fetchFollowedDiscussions() {
    displayLoading(true); // Show loading indicator

    // Fetch followed discussions from the server with authentication
    fetchWithAuth('/followed-discussions', {
        method: 'GET' // Use the GET method
    })
    .then(response => {
        // Check if the response is not okay (status is not in the range 200-299)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json(); // Parse the JSON response body
    })
    .then(data => {
        // Find the feed element for the 'following' tab
        const feed = document.querySelector('#following .activity-feed');
        if (!feed) {
            console.error(`No element found with selector: #following .activity-feed`);
            return;
        }
        feed.innerHTML = ''; // Clear the feed

        // Check if the server response indicates success
        if (data.success) {
            // If no discussions are found, display a message
            if (data.discussions.length === 0) {
                const noDiscussionMessage = document.createElement('div');
                noDiscussionMessage.classList.add('no-suggestion'); // Add class for styling
                noDiscussionMessage.textContent = "No discussions found"; // Set the message text
                feed.appendChild(noDiscussionMessage); // Append the message to the feed
            } else {
                // Otherwise, add each discussion to the feed
                data.discussions.forEach(discussion => {
                    addDiscussionToFeed(discussion, 'following');
                });
            }
        } else {
            console.error('Error fetching followed discussions:', data.error); // Log any errors
            alert('Error fetching followed discussions.'); // Display an alert with the error message
        }
        displayLoading(false); // Hide the loading indicator
    })
    .catch(error => {
        // Handle network or server errors
        console.error('Network or server error:', error);
        alert('Error fetching followed discussions.'); // Display an alert with the error message
        displayLoading(false); // Hide the loading indicator
    });
}


//-------------------------------------------------------------------clear search input and capitalization of first letter for username----------------------------------------------------

function clearSearch() {
    document.getElementById('search-input').value = '';
    fetchDiscussions(getActiveTab());
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//-----------------------------------------------------------------For creating new discussion and adding it to the Main Feed----------------------------------------------------------------

// Function to add a discussion post to the feed
function addDiscussionToFeed(discussion, feedType) {
    // Find the feed element based on the feed type
    const feed = document.querySelector(`#${feedType} .activity-feed`);
    if (!feed) {
        console.error(`Feed element not found for feed type: ${feedType}`);
        return;
    }

    // Create a new div element for the post
    const post = document.createElement('div');
    post.classList.add('post'); // Add the 'post' class for styling
    post.setAttribute('data-id', discussion.id); // Set a data attribute with the discussion ID
    post.setAttribute('data-user-id', discussion.user_id); // Set a data attribute with the user ID

    // Determine if the user liked or disliked the discussion
    const likedByUser = discussion.userLiked ? 'true' : 'false';
    const dislikedByUser = discussion.userDisliked ? 'true' : 'false';

    // Prepare text for likes, dislikes, and views
    const likesText = `👍 ${discussion.likes} Likes`;
    const dislikesText = `👎 ${discussion.dislikes} Dislikes`;
    const viewsText = `👁️ ${discussion.views} Views`;

    // Capitalize the first letter of the username and get the profile picture URL
    const capitalizedUsername = capitalizeFirstLetter(discussion.username);
    const profilePicUrl = discussion.profilePic || 'images/profilePic.jpeg';

    // Set the inner HTML of the post element
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
                <button class="pin-button" data-id="${discussion.id}">${discussion.pinned ? 'Unpin' : 'Pin'}</button>
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

    // Append the post to the feed; prepend if pinned
    if (discussion.pinned) {
        feed.prepend(post);
    } else {
        feed.appendChild(post);
    }

    // Fetch the comment count for the discussion
    fetchCommentCountForDiscussion(discussion.id);

    // Get references to the buttons in the post
    const likeButton = post.querySelector('.like-button');
    const dislikeButton = post.querySelector('.dislike-button');
    const commentButton = post.querySelector('.comment-button');
    const followButton = post.querySelector('.follow-button');
    const suggestionButton = post.querySelector('.suggestion-button');
    const pinButton = post.querySelector('.pin-button');

    // Hide the follow button for discussions posted by the logged-in user
    if (discussion.user_id === getCurrentUserId()) {
        followButton.style.display = 'none';
    }

    // Add event listeners for the like button
    likeButton.addEventListener('click', function () {
        if (this.getAttribute('data-liked') === 'true') {
            alert('You have already liked this discussion.');
            return;
        }
        incrementLikes(discussion.id, this, dislikeButton);
        incrementViews(discussion.id);
    });

    // Add event listeners for the dislike button
    dislikeButton.addEventListener('click', function () {
        if (this.getAttribute('data-disliked') === 'true') {
            alert('You have already disliked this discussion.');
            return;
        }
        incrementDislikes(discussion.id, likeButton, this);
        incrementViews(discussion.id);
    });

    // Add event listeners for the comment button
    commentButton.addEventListener('click', function () {
        const discussionId = this.getAttribute('data-id');
        incrementViews(discussionId);
        window.location.href = `comment.html?discussionId=${discussionId}`;
    });

    // Add event listeners for the follow button
    followButton.addEventListener('click', function () {
        const followeeId = post.getAttribute('data-user-id');
        if (this.textContent === 'Follow') {
            console.log('Following user:', followeeId);
            followUser(followeeId, this);
        } else {
            console.log('Unfollowing user:', followeeId);
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


//------------------------------------------------------------------For the increament of views logic-------------------------------------------------------

// Function to increment the view count for a specific discussion by its ID
function incrementViews(discussionId) {
    // Sending a POST request to the server endpoint to increment the view count
    fetchWithAuth(`/discussions/${discussionId}/view`, {
        method: 'POST'  // Using the POST method to indicate we are making a change
    })
    .then(response => response.json())  // Parsing the JSON response from the server
    .then(data => {
        if (data.success) {  // Checking if the server response indicates success
            console.log(`Views incremented for discussion ${discussionId}. Current views: ${data.views}`);
            // Logging a success message with the current view count
        } else {
            console.error('Error incrementing views:', data.error);  
            // Logging an error message if the server indicates a failure
        }
    })
    .catch(error => {
        console.error('Error incrementing views:', error);  
        // Logging an error message if there is a network or other error during the fetch
    });
}

//-----------------------------------------------------------------increment for likes0-----------------------------------------------------------------

// Function to increment the like count for a specific discussion by its ID
function incrementLikes(discussionId, likeButton, dislikeButton) {
    // Sending a POST request to the server endpoint to increment the like count
    fetchWithAuth(`/discussions/${discussionId}/like`, {
        method: 'POST'  // Using the POST method to indicate we are making a change
    })
    .then(response => response.json())  // Parsing the JSON response from the server
    .then(data => {
        if (data.success) {  // Checking if the server response indicates success
            likeButton.textContent = `👍 ${data.likes} Likes`;
            // Updating the like button text to show the new number of likes
            likeButton.setAttribute('data-liked', 'true');
            // Setting a custom attribute to indicate the item is liked
            dislikeButton.setAttribute('data-disliked', 'false');
            // Resetting the dislike button's custom attribute to indicate it is not disliked
            dislikeButton.textContent = `👎 0 Dislikes`;
            // Resetting the dislike button text to show zero dislikes
        } else {
            alert('Error adding like.');
            // Alerting the user if the server indicates a failure
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Logging any network or other errors that occur during the fetch
        alert('Error adding like.');
        // Alerting the user if there is an error during the fetch
    });
}


//----------------------------------------------------------------increment for dislike-------------------------------------------------------------------

// Function to increment the dislike count for a specific discussion by its ID
function incrementDislikes(discussionId, likeButton, dislikeButton) {
    // Sending a POST request to the server endpoint to increment the dislike count
    fetchWithAuth(`/discussions/${discussionId}/dislike`, {
        method: 'POST'  // Using the POST method to indicate we are making a change
    })
    .then(response => response.json())  // Parsing the JSON response from the server
    .then(data => {
        if (data.success) {  // Checking if the server response indicates success
            dislikeButton.textContent = `👎 ${data.dislikes} Dislikes`;
            // Updating the dislike button text to show the new number of dislikes
            dislikeButton.setAttribute('data-disliked', 'true');
            // Setting a custom attribute to indicate the item is disliked
            likeButton.setAttribute('data-liked', 'false');
            // Resetting the like button's custom attribute to indicate it is not liked
            likeButton.textContent = `👍 0 Likes`;
            // Resetting the like button text to show zero likes
        } else {
            alert('Error adding dislike.');
            // Alerting the user if the server indicates a failure
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Logging any network or other errors that occur during the fetch
        alert('Error adding dislike.');
        // Alerting the user if there is an error during the fetch
    });
}


//-------------------------------------------------------------Amelia part - fetching the comments count by discussionId-----------------------------------------------------------------

// Function to fetch the comment count for a specific discussion by its ID
function fetchCommentCountForDiscussion(discussionId) {
    console.log(`Fetching comment count for discussion ID: ${discussionId}`);
    // Logging the start of the fetch process for the given discussion ID

    fetch(`/comments/discussion/${discussionId}/count`)
        // Sending a GET request to the server endpoint to get the comment count for the discussion

        .then(response => {
            console.log(`Response received for discussion ID: ${discussionId}`);
            // Logging that a response has been received for the given discussion ID

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
                // If the response is not OK (status code not in the range 200-299), throw an error
            }

            return response.json();
            // Parsing the JSON response from the server
        })
        .then(data => {
            console.log(`Data received for discussion ID: ${discussionId}:`, data);
            // Logging the received data for the given discussion ID

            if (data.count !== undefined) {
                const commentCountElement = document.getElementById(`comment-count-${discussionId}`);
                // Finding the DOM element that will display the comment count using the discussion ID

                if (commentCountElement) {
                    commentCountElement.textContent = `💬 ${data.count} Comments`;
                    // Updating the text content of the comment count element with the new count

                    console.log(`Updated comment count for discussion ID: ${discussionId}`);
                    // Logging that the comment count has been updated for the given discussion ID
                } else {
                    console.error(`Comment count element not found for discussion ID: ${discussionId}`);
                    // Logging an error if the comment count element is not found in the DOM
                }
            } else {
                console.error('Error fetching comment count for discussion:', data);
                // Logging an error if the data does not contain the comment count
            }
        })
        .catch(error => {
            console.error('Network or server error:', error);
            // Logging any network or server errors that occur during the fetch
        });
}



//--------------------------------------------------------------------------For pin and unpin of discussion------------------------------------------------------

// Function to toggle the pin status of a discussion by its ID and action (pin/unpin)
function togglePinDiscussion(discussionId, action, button) {
    // Sending a POST request to the server endpoint to pin or unpin the discussion
    fetchWithAuth(`/discussions/${discussionId}/${action}`, {
        method: 'POST',  // Using the POST method to indicate we are making a change
        headers: {
            'Content-Type': 'application/json',  // Setting the content type of the request to JSON
        },
    })
    .then(response => {
        if (!response.ok) {
            // If the response is not OK (status code not in the range 200-299), parse the error message
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }
        return response.json();  // Parsing the JSON response from the server
    })
    .then(data => {
        if (data.success) {
            fetchDiscussions(getActiveTab());  // Refresh the discussions list to reflect the change
        } else {
            alert('Error pinning/unpinning discussion.');
            // Alerting the user if the server indicates a failure
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Logging any network or other errors that occur during the fetch

        alert(`Network error: ${error.message}`);
        // Alerting the user if there is a network error during the fetch
    });
}



//-----------------------------------------------------------logic for following of user----------------------------------------------------------

// Function to follow a user
function followUser(followeeId, button) {
    // Convert followeeId to a number
    const followeeIdNum = parseInt(followeeId, 10);

    // Check if followeeId is a valid number
    if (isNaN(followeeIdNum)) {
        console.error('Invalid followeeId:', followeeId);
        alert('Invalid followee ID.');
        return;
    }

    console.log('Attempting to follow user ID:', followeeIdNum); // Debugging log

    // Make a POST request to follow the user
    fetchWithAuth('/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followeeId: followeeIdNum }) // Send followeeId in request body
    })
    .then(response => {
        // Check if the response status is OK
        if (!response.ok) {
            console.error('Failed to follow user, status:', response.status);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Parse JSON response
    })
    .then(data => {
        console.log('Follow response data:', data); // Debugging log
        // Check if the operation was successful
        if (data.success) {
            // Update button text and style for 'Unfollow'
            button.textContent = 'Unfollow';
            button.classList.remove('follow-button');
            button.classList.add('unfollow-button');
            console.log(`Updated follow status for user ID: ${followeeIdNum} to 'Unfollow'`);
        } else {
            alert('Error following user.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while trying to follow the user.'); // Alert user of error
    });
}



//---------------------------------------------------------------------logic for unfollowing user----------------------------------------------------------

// Function to unfollow a user by their ID
function unfollowUser(followeeId, button) {
    const followeeIdNum = parseInt(followeeId, 10);
    // Convert the followeeId to a number and validate it
    if (isNaN(followeeIdNum)) {
        console.error('Invalid followeeId:', followeeId);
        // Log an error if the followeeId is not a valid number
        alert('Invalid followee ID.');
        // Alert the user if the followeeId is invalid
        return;
        // Exit the function if the followeeId is invalid
    }

    console.log('Attempting to unfollow user ID:', followeeIdNum); // Debugging log
    // Log the attempt to unfollow the user for debugging purposes

    fetchWithAuth('/unfollow', {
        method: 'POST',  // Using the POST method to indicate a change
        headers: { 'Content-Type': 'application/json' },  // Setting the content type of the request to JSON
        body: JSON.stringify({ followeeId: followeeIdNum })  // Sending the followeeId in the request body
    })
    .then(response => {
        if (!response.ok) {
            console.error('Failed to unfollow user, status:', response.status);
            // Log an error if the response status is not OK (status code not in the range 200-299)
            throw new Error(`HTTP error! Status: ${response.status}`);
            // Throw an error to be caught by the catch block
        }
        return response.json();  // Parse the JSON response from the server
    })
    .then(data => {
        console.log('Unfollow response data:', data); // Debugging log
        // Log the response data for debugging purposes

        if (data.success) {
            button.textContent = 'Follow';
            // Update the button text to 'Follow'
            button.classList.remove('unfollow-button');
            // Remove the 'unfollow-button' class from the button
            button.classList.add('follow-button');
            // Add the 'follow-button' class to the button
            console.log(`Updated follow status for user ID: ${followeeIdNum} to 'Follow'`);
            // Log the updated follow status for debugging purposes

            if (getActiveTab() === 'following') {
                // Check if the active tab is 'following'
                const postElement = button.closest('.post');
                // Find the closest post element to the button
                if (postElement) {
                    postElement.remove();
                    // Remove the post element from the DOM if it exists
                }
            }
        } else {
            alert('Error unfollowing user.');
            // Alert the user if the server indicates a failure
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Log any network or other errors that occur during the fetch

        alert('An error occurred while trying to unfollow the user.');
        // Alert the user if there is an error during the fetch
    });
}



// --------------------------------------------------------------------------Check for follow or unfollow status--------------------------------------------------------

// Function to check the follow status of a user by their ID
function checkFollowStatus(followeeId) {
    // Sending a GET request to the server endpoint to check follow status
    return fetchWithAuth(`/follow-status?followeeId=${followeeId}`, {
        method: 'GET',  // Using the GET method to retrieve data
        headers: { 'Content-Type': 'application/json' }  // Setting the content type of the request to JSON
    })
    .then(response => {
        if (!response.ok) {
            // If the response is not OK (status code not in the range 200-299), throw an error
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();  // Parsing the JSON response from the server
    })
    .then(data => {
        if (data.success) {
            return data.following;  // Returning the follow status if the request was successful
        } else {
            throw new Error('Error checking follow status');  // Throwing an error if the request was unsuccessful
        }
    })
    .catch(error => {
        console.error('Error checking follow status:', error);  // Logging any errors that occur during the fetch
        throw error;  // Re-throwing the error to be handled by the caller
    });
}


// --------------------------------------------------------------------------for GEMINI API, to generate suggestion answers or opinion with pop up function--------------------------------------------

// Function to fetch and display suggestions for a discussion in a popup
async function showSuggestionsPopup(discussionId) {
    try {
        const token = getToken();  // Retrieve the authentication token
        if (!token) {
            throw new Error('No token provided');  // Throw an error if no token is provided
        }

        // Fetch suggestions from the server
        const response = await fetch(`/discussions/${discussionId}/suggestions`, {
            method: 'GET',  // Use GET method to retrieve data
            headers: {
                'Content-Type': 'application/json',  // Set content type to JSON
                'Authorization': `Bearer ${token}`  // Include the token in the Authorization header
            }
        });

        const data = await response.json();  // Parse the JSON response from the server

        if (data.success) {
            let suggestions = data.suggestions;  // Retrieve suggestions from the response

            // Ensure suggestions is an array or convert it to an array
            if (!Array.isArray(suggestions)) {
                suggestions = [suggestions];
            }

            const suggestionsContainer = document.getElementById('suggestionsContainer');
            suggestionsContainer.innerHTML = '';  // Clear previous suggestions

            if (suggestions.length > 0) {
                // Iterate over each suggestion and create an element for it
                suggestions.forEach(suggestion => {
                    const suggestionElement = document.createElement('div');
                    suggestionElement.classList.add('suggestion');  // Add 'suggestion' class to the element
                    suggestionElement.innerText = suggestion;  // Set the text content of the element
                    suggestionsContainer.appendChild(suggestionElement);  // Append the element to the container
                });
            } else {
                // Create and display a message if there are no suggestions
                const noSuggestionElement = document.createElement('div');
                noSuggestionElement.classList.add('no-suggestion');  // Add 'no-suggestion' class to the element
                noSuggestionElement.innerText = 'No suggestions available.';
                suggestionsContainer.appendChild(noSuggestionElement);  // Append the element to the container
            }

            // Show the popup
            document.getElementById('suggestionPopup').style.display = 'block';
        } else {
            console.error('Error fetching suggestions:', data.error);  // Log an error if fetching suggestions fails
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);  // Catch and log any errors that occur
    }
}

// Function to close the suggestion popup
function closeSuggestionPopup() {
    document.getElementById('suggestionPopup').style.display = 'none';  // Hide the popup
}



//---------------------------------------------------------------------------This is the General Front end js----------------------------------------------------

// Function to show or hide the loading element
function displayLoading(show) {
    // Get the element with the ID 'loading'
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        // Set the display property based on the 'show' parameter
        // If 'show' is true, set to 'block' to make it visible
        // If 'show' is false, set to 'none' to hide it
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

// Function to display the popup
function openPopup() {
    // Set the display property of the element with the ID 'popup' to 'block'
    document.getElementById("popup").style.display = "block";
}

// Function to hide the popup
function closePopup() {
    // Set the display property of the element with the ID 'popup' to 'none'
    document.getElementById("popup").style.display = "none";
}

// Event listener for clicks anywhere on the window
window.onclick = function(event) {
    // Check if the click happened on the element with ID 'popup'
    if (event.target == document.getElementById("popup")) {
        // Hide the popup if the click was on it
        document.getElementById("popup").style.display = "none";
    }
}

// Function to switch tabs
function showTab(tabName) {
    // Get all elements with the class 'tab-btn'
    const tabButtons = document.querySelectorAll('.tab-btn');
    // Remove the 'active' class from all tab buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));

    // Get all elements with the class 'tab-content'
    const tabs = document.querySelectorAll('.tab-content');
    // Hide all tab contents
    tabs.forEach(tab => tab.style.display = 'none');

    // Show the tab content with the ID matching 'tabName'
    document.querySelector(`#${tabName}`).style.display = 'block';
    // Add the 'active' class to the button that triggered the tab change
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');

    // Fetch discussions related to the tab (function call assumed to be defined elsewhere)
    fetchDiscussions(tabName);
}

// Function to get the currently active tab
function getActiveTab() {
    // Get the active tab button
    const activeTab = document.querySelector('.tab-btn.active');
    // Return the tab name by extracting it from the 'onclick' attribute of the active tab button
    // Default to 'mainFeed' if no active tab is found
    return activeTab ? activeTab.getAttribute('onclick').match(/showTab\('([^']+)'\)/)[1] : 'mainFeed';
}
