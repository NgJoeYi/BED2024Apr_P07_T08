document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display reviews
    fetchReviews();

    const currentUserId = sessionStorage.getItem('userId'); // Get the current user ID from session storage
    console.log('Current User ID:', currentUserId); // Debug log

    const navTitles = document.querySelectorAll('.nav-title');
    navTitles.forEach(title => {
        title.addEventListener('click', () => {
            const subNav = title.nextElementSibling;
            if (subNav.style.display === "none" || subNav.style.display === "") {
                subNav.style.display = "block";
            } else {
                subNav.style.display = "none";
            }
        });
    });

    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    hamburger.addEventListener('click', () => {
        if (sidebar.style.width === "250px" || sidebar.style.width === "") {
            sidebar.style.width = "60px";
            document.querySelectorAll('.nav-item').forEach(item => {
                item.style.display = 'none';
            });
        } else {
            sidebar.style.width = "250px";
            document.querySelectorAll('.nav-item').forEach(item => {
                item.style.display = 'block';
            });
        }
    });

    const reviewStars = document.querySelectorAll('.review .fa-star');
    reviewStars.forEach(star => {
        star.addEventListener('click', () => {
            const value = star.getAttribute('data-value');
            const parent = star.closest('.rating');
            const stars = parent.querySelectorAll('.fa-star');
            if (star.classList.contains('selected') && value === '1') {
                stars.forEach(s => s.classList.remove('selected'));
            } else {
                stars.forEach(s => {
                    if (s.getAttribute('data-value') <= value) {
                        s.classList.add('selected');
                    } else {
                        s.classList.remove('selected');
                    }
                });
            }
        });
    });

    const popupStars = document.querySelectorAll('.popup .fa-star');
    popupStars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const value = star.getAttribute('data-value');
            popupStars.forEach(s => {
                if (s.getAttribute('data-value') <= value) {
                    s.classList.add('hover');
                } else {
                    s.classList.remove('hover');
                }
            });
        });

        star.addEventListener('mouseout', () => {
            popupStars.forEach(s => s.classList.remove('hover'));
        });

        star.addEventListener('click', () => {
            const value = star.getAttribute('data-value');
            if (star.classList.contains('selected') && value === '1') {
                popupStars.forEach(s => s.classList.remove('selected'));
            } else {
                popupStars.forEach(s => {
                    if (s.getAttribute('data-value') <= value) {
                        s.classList.add('selected');
                    } else {
                        s.classList.remove('selected');
                    }
                });
            }
        });
    });

    document.getElementById('sort').value = 'mostRecent'; // Set default value
    sortReviews(); // Sort reviews by most recent on page load
});

function showPopup(type) {
    const popup = document.getElementById('popup');
    const popupContent = popup.querySelector('.popup-content h2');
    popupContent.textContent = type === 'add' ? 'Leave a Review' : 'Edit Review';
    popup.style.display = 'flex';

    if (type === 'add') {
        document.getElementById('review-text').value = '';
        document.querySelectorAll('.popup .fa-star').forEach(star => {
            star.classList.remove('selected');
        });
    }
}

function closePopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
}

function filterReviews() {
    const filter = document.getElementById('filter').value;
    const reviews = document.querySelectorAll('.review');
    reviews.forEach(review => {
        const rating = review.querySelectorAll('.fa-star.selected').length;
        review.style.display = filter === 'all' || filter == rating ? 'flex' : 'none';
    });
}

function sortReviews() {
    const sort = document.getElementById('sort').value;
    const reviewsContainer = document.getElementById('reviews');
    const reviews = Array.from(reviewsContainer.children);

    reviews.sort((a, b) => {
        const ratingA = a.querySelectorAll('.fa-star.selected').length;
        const ratingB = b.querySelectorAll('.fa-star.selected').length;
        const dateA = new Date(a.getAttribute('data-date'));
        const dateB = new Date(b.getAttribute('data-date'));

        if (sort === 'mostRecent') {
            return dateB - dateA;
        } else if (sort === 'highestRating') {
            return ratingB - ratingA;
        } else if (sort === 'lowestRating') {
            return ratingA - ratingB;
        }
    });

    reviews.forEach(review => reviewsContainer.appendChild(review));
}

function deleteReview(button) {
    const review = button.closest('.review');
    if (confirm("Are you sure you want to delete this review?")) {
        review.remove();
    }
}

function postReview() {
    closePopup();
}

function editReview(button) {
    const review = button.closest('.review');
    const reviewUserId = parseInt(review.dataset.userId, 10); // Get the user ID from the review
    const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); // Get the current user ID from session storage

    if (reviewUserId !== currentUserId) {
        alert('You can only edit your own reviews.');
        return;
    }

    const reviewText = review.querySelector('.review-details p').textContent;
    const reviewStars = review.querySelectorAll('.fa-star');
    const popupStars = document.querySelectorAll('.popup .fa-star');

    document.getElementById('review-text').value = reviewText;

    const rating = Array.from(reviewStars).filter(star => star.classList.contains('selected')).length;

    popupStars.forEach(star => {
        if (star.getAttribute('data-value') <= rating) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });

    showPopup('edit');

    const postButton = document.querySelector('.popup-content button');
    postButton.onclick = () => {
        const updatedText = document.getElementById('review-text').value;
        const updatedRating = document.querySelectorAll('.popup .fa-star.selected').length;

        fetch(`/reviews/${review.getAttribute('data-id')}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ review_text: updatedText, rating: updatedRating, userId: currentUserId }) // Include userId
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            closePopup();
            fetchReviews();
        })
        .catch(error => console.error('Error updating review:', error));
    };
}

function fetchReviews() {
    fetch('/reviews')
        .then(response => response.json())
        .then(reviews => {
            const reviewsContainer = document.getElementById('reviews');
            reviewsContainer.innerHTML = ''; // Clear existing reviews

            reviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.classList.add('review');
                reviewElement.setAttribute('data-id', review.review_id); // Add this line
                reviewElement.setAttribute('data-user-id', review.user_id); // Add this line
                reviewElement.setAttribute('data-date', review.review_date);
                reviewElement.innerHTML = `
                    <div class="review-content">
                        <div class="review-author">
                            <img src="images/profilePic2" alt="Author Avatar" class="author-avatar">
                            <div class="review-details">
                                <div class="author-name">${review.user_name}</div>
                                <div class="rating">
                                    ${[...Array(5)].map((_, i) => `<i class="fa fa-star ${i < review.rating ? 'selected' : ''}" data-value="${i + 1}"></i>`).join('')}
                                </div>
                                <p>${review.review_text}</p>
                                <p class="review-date">Posted on: ${new Date(review.review_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    <div class="review-actions">
                        <button onclick="editReview(this)">Edit</button>
                        <button class="deleteReview" onclick="deleteReview(this)">Delete</button>
                        <button class="helpful">👍 Helpful</button>
                    </div>
                `;
                reviewsContainer.appendChild(reviewElement);
            });
        })
        .catch(error => console.error('Error fetching reviews:', error));
}
