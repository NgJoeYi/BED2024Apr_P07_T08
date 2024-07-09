document.addEventListener('DOMContentLoaded', () => {

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseID'); 
     
    if (courseId) {
        fetchReviews(courseId);
    } else {
        console.error('courseId is not defined');
    }

    const token = sessionStorage.getItem('token'); // Get the token from session storage
    // const currentUserId = sessionStorage.getItem('userId'); // Get the current user ID from session storage
    // console.log('Current User ID:', currentUserId); // Debug log

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

    document.getElementById('filter').addEventListener('change', () => {
        fetchReviews(courseId);
    });

    document.getElementById('sort').addEventListener('change', () => {
        fetchReviews(courseId);
    });

    document.getElementById('sort').value = 'mostRecent';
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

        const postButton = document.querySelector('.popup-content button');
        postButton.onclick = postReview;
    }
}

function closePopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
}

async function deleteReview(button) {
    const review = button.closest('.review');
    const reviewId = review.getAttribute('data-id');
    const token = sessionStorage.getItem('token');
    // const userId = sessionStorage.getItem('userId');
    // console.log(`Attempting to delete review with ID: ${reviewId} by user ID: ${userId}`);

    try {
        const response = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // body: JSON.stringify({ userId }) // Include userId in the body
        });

        if (response.ok) {
            alert('Review deleted successfully!');
            review.remove();
        } else {
            const errorMessage = await response.text();
            console.error('Failed to delete review:', errorMessage);
            alert('You can only delete your own reviews');
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        alert('Error deleting review');
    }
}

function postReview() {
    const reviewText = document.getElementById('review-text').value;
    const rating = document.querySelectorAll('.popup .fa-star.selected').length;
    const token = sessionStorage.getItem('token');
    // const userId = sessionStorage.getItem('userId'); // Get the current user ID from session storage

    if (!reviewText || !rating || !token) {
        alert('Please log in or sign up to add reviews.');
        return;
    }

    fetch('http://localhost:3000/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ review_text: reviewText, rating: rating }) // Include userId - no more aft jwt
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        closePopup();
        fetchReviews();
    })
    .catch(error => console.error('Error posting review:', error));
}

function editReview(button) {
    const review = button.closest('.review');
    const reviewUserId = parseInt(review.dataset.userId, 10); // Get the user ID from the review
    const token = sessionStorage.getItem('token');
    // const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); // Get the current user ID from session storage

    // if (reviewUserId !== currentUserId) {
    //     alert('You can only edit your own reviews.');
    //     return;
    // }

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

        fetch(`http://localhost:3000/reviews/${review.getAttribute('data-id')}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ review_text: updatedText, rating: updatedRating }) // Include userId - no more aft jwt
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

function fetchReviews(courseId) {
    if (isNaN(courseId)) {
        console.error('Invalid course ID');
        return;
    }

    const filter = document.getElementById('filter').value;
    const sort = document.getElementById('sort').value;

    fetch(`http://localhost:3000/reviews?courseId=${courseId}&filter=${filter}&sort=${sort}`)
        .then(response => response.json())
        .then(reviews => {
            console.log('Fetched Reviews:', reviews); // Log the fetched reviews
            if (!Array.isArray(reviews)) {
                throw new TypeError('Expected an array of reviews');
            }

            const reviewsContainer = document.getElementById('reviews');
            reviewsContainer.innerHTML = ''; // Clear existing reviews

            reviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.classList.add('review');
                reviewElement.setAttribute('data-id', review.review_id);
                reviewElement.setAttribute('data-user-id', review.user_id);
                reviewElement.setAttribute('data-date', review.review_date);
                reviewElement.innerHTML = `
                    <div class="review-content">
                        <div class="review-author">
                            <img src="${review.profilePic || 'images/profilePic.jpeg'}" alt="Author Avatar" class="author-avatar">
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
