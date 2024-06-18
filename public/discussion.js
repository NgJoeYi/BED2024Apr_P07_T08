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

function addDiscussionToFeed(discussion) {
    const feed = document.querySelector('.activity-feed');
    const post = document.createElement('div');
    post.classList.add('post');

    post.innerHTML = `
        <div class="post-header">
            <div class="profile-pic"></div>
            <div class="username">Bot</div>
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
                <span>👍 0 Likes</span>
                <span>👎 0 Dislikes</span>
                <span>💬 0 Comments</span>
            </div>
            <button class="comment-button">Go to Comment</button>
        </div>
    `;

    feed.prepend(post);
}