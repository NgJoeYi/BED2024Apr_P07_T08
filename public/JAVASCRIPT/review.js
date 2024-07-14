document.addEventListener('DOMContentLoaded', () => {

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseID'); 

    // Log the courseId for debugging purposes
    console.log('Retrieved courseId:', courseId);
     
    if (courseId && !isNaN(courseId)) {
        fetchReviews(courseId);
    } else {
        console.error('courseId is not defined or is invalid');
    }    

    const token = sessionStorage.getItem('token'); // Get the token from session storage
    const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); // Get the current user ID from session storage and convert to integer

    // Hide "Add Review" button if the user is not logged in
    if (!token) {
        const addReviewBtn = document.getElementById('addReviewBtn');
        if (addReviewBtn) {
            addReviewBtn.style.display = 'none';
        }
    }

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

    // document.getElementById('filter').addEventListener('change', () => {
    //     const urlParams = new URLSearchParams(window.location.search);
    //     const courseId = urlParams.get('courseID');
    //     if (courseId && !isNaN(courseId)) {
    //         fetchReviews(courseId);
    //     } else {
    //         console.error('Invalid course ID');
    //     }
    // });
    
    // document.getElementById('sort').addEventListener('change', () => {
    //     const urlParams = new URLSearchParams(window.location.search);
    //     const courseId = urlParams.get('courseID');
    //     if (courseId && !isNaN(courseId)) {
    //         fetchReviews(courseId);
    //     } else {
    //         console.error('Invalid course ID');
    //     }
    // });

    document.getElementById('filter').addEventListener('change', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseID');
        if (courseId && !isNaN(courseId)) {
            fetchReviews(courseId);
        } else {
            console.error('Invalid course ID');
        }
    });
    
    document.getElementById('sort').addEventListener('change', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseID');
        if (courseId && !isNaN(courseId)) {
            fetchReviews(courseId);
        } else {
            console.error('Invalid course ID');
        }
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

// async function deleteReview(button) {
//     const review = button.closest('.review');
//     const reviewId = review.getAttribute('data-id');
//     const token = sessionStorage.getItem('token');
//     // const userId = sessionStorage.getItem('userId');
//     console.log(`Attempting to delete review with ID: ${reviewId} by user with token: ${token}`); // Debug log

//     try {
//         const response = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
//             method: 'DELETE',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             }
//         });

//         if (response.ok) {
//             alert('Review deleted successfully!');
//             review.remove();
//         } else {
//             const errorMessage = await response.text();
//             console.error('Failed to delete review:', errorMessage);
//             alert('You can only delete your own reviews');
//         }
//     } catch (error) {
//         console.error('Error deleting review:', error);
//         alert('Error deleting review');
//     }
// }

async function deleteReview(button) {
    const review = button.closest('.review');
    const reviewId = review.getAttribute('data-id');
    // const token = sessionStorage.getItem('token');

    // console.log(`Attempting to delete review with ID: ${reviewId} by user with token: ${token}`);

    try {
        const response = await fetchWithAuth(`http://localhost:3000/reviews/${reviewId}`, { // ------------------------------------------------- headers in jwtutility.js
            method: 'DELETE'
        });

        if (!response) return; // ********************** jwt
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
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = parseInt(urlParams.get('courseID'), 10); // Ensure courseId is an integer
    const reviewText = document.getElementById('review-text').value;
    const rating = document.querySelectorAll('.popup .fa-star.selected').length;
    // const token = sessionStorage.getItem('token');

    // console.log('Posting review with courseId:', courseId, 'reviewText:', reviewText, 'rating:', rating, 'token:', token); // Debug log

    // if (!token) {
    //     alert('User is not authenticated. Please log in.');
    //     return;
    // }

    fetchWithAuth('http://localhost:3000/reviews', { // ------------------------------------------------- headers in jwtutility.js
        method: 'POST',
        body: JSON.stringify({ review_text: reviewText, rating: rating, courseId: courseId }) // Ensure courseId is passed as an integer
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        console.log('Review posted successfully:', data); // Debug log
        alert(data.message);
        closePopup();
        fetchReviews(courseId); // Ensure courseId is passed to fetchReviews
    })
    .catch(error => {
        console.error('Error posting review:', error);
        alert(`${error.error || 'Internal Server Error'}`);
    });
}

function editReview(button) {
    const review = button.closest('.review');
    const reviewUserId = parseInt(review.dataset.userId, 10);
    const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); // Get the current user ID from session storage and convert to integer
    // const token = sessionStorage.getItem('token'); // Get the token from session storage

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
        const reviewId = review.getAttribute('data-id');
        const courseId = parseInt(new URLSearchParams(window.location.search).get('courseID'), 10);

        fetchWithAuth(`http://localhost:3000/reviews/${reviewId}`, { // ------------------------------------------------- headers in jwtutility.js
            method: 'PUT',
            body: JSON.stringify({ review_text: updatedText, rating: updatedRating, courseId: courseId })
        })
        .then(response => {
            if (!response) return; // ********************** jwt
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            closePopup();
            fetchReviews(courseId);
        })
        .catch(error => {
            console.error('Error updating review:', error);
            alert(`${error.error || 'Internal Server Error'}`);
        });
    };
}

function fetchReviews(courseId) {
    console.log('Course Id in fetchReviews(courseId):', courseId);
    if (isNaN(courseId)) {
        console.error('Invalid course ID:', courseId); // Debug log
        return;
    }

    const filter = document.getElementById('filter').value;
    const sort = document.getElementById('sort').value;
    const token = sessionStorage.getItem('token'); // Get the token from session storage
    const currentUserId = parseInt(sessionStorage.getItem('userId'), 10); // Get the current user ID from session storage and convert to integer

    let url = `http://localhost:3000/reviews/course/${courseId}`;
    if (filter !== 'all') {
        url += `/rating/${filter}`;
    }
    if (sort !== 'mostRecent') {
        url += `/sort/${sort}`;
    }

    console.log('Fetching reviews with URL:', url); // Debug log

    fetch(url)
        .then(response => {
            if (!response.ok) {
                console.error('Failed to fetch reviews:', response.statusText); // Debug log
                throw new Error('Failed to fetch reviews');
            }
            return response.json();
        })
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

                // Add buttons conditionally based on user login and ownership
                const reviewActions = token && review.user_id === currentUserId ? `
                    <button onclick="editReview(this)">Edit</button>
                    <button class="deleteReview" onclick="deleteReview(this)">Delete</button>
                ` : '';

                reviewElement.innerHTML = `
                    <div class="review-content">
                        <div class="review-author">
                            <img src="${review.profilePic || 'images/profilePic.jpeg'}" alt="Author Avatar" class="author-avatar">
                            <div class="review-details">
                            <div class="author-info">
                                <div class="author-name">${review.user_name}</div>
                                <div class="author-role">(${review.role || 'Role not found'})</div>
                            </div>
                            <div class="rating">
                                    ${[...Array(5)].map((_, i) => `<i class="fa fa-star ${i < review.rating ? 'selected' : ''}" data-value="${i + 1}"></i>`).join('')}
                                </div>
                                <p>${review.review_text}</p>
                                <p class="review-date">Posted on: ${new Date(review.review_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    <div class="review-actions">
                        ${reviewActions}
                    </div>
                `;
                reviewsContainer.appendChild(reviewElement);
            });
        })
        .catch(error => console.error('Error fetching reviews:', error));
}

// function getUserIdFromToken(token) {
//     if (!token) {
//         console.log('No token found'); // Debug log
//         return null;
//     }
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     console.log('Payload from token:', payload); // Debug log
//     return payload.id;
// }
