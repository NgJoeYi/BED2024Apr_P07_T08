document.addEventListener('DOMContentLoaded', () => {
    fetchReviews();
    getLecturesByCourse();

    const currentUserId = sessionStorage.getItem('userId'); 
    console.log('Current User ID:', currentUserId);

    document.getElementById('sort').value = 'mostRecent';
    sortReviews();

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
});

async function getLecturesByCourse() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseID = urlParams.get('courseID');
    
    if (!courseID) {
        console.error('No course ID found in URL.');
        return;
    }

    try {
        const response = await fetch(`/lectures/course/${courseID}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const lectures = await response.json();
        console.log('Fetched lectures:', lectures);
        displayLectures(lectures);
    } catch (error) {
        console.error('Error fetching lectures:', error);
    }
}

function displayLectures(lectures) {
    const sidebar = document.querySelector('.sidebar .nav');
    sidebar.innerHTML = ''; 

    const groupedLectures = lectures.reduce((acc, lecture) => {
        if (!acc[lecture.ChapterName]) {
            acc[lecture.ChapterName] = [];
        }
        acc[lecture.ChapterName].push(lecture);
        return acc;
    }, {});

    for (const chapterName in groupedLectures) {
        const navItem = document.createElement('div');
        navItem.className = 'nav-item';

        const subNavItems = groupedLectures[chapterName]
            .map(lecture => `<div class="sub-nav-item" data-lecture-id="${lecture.LectureID}">${lecture.Title}</div>`)
            .join('');

        navItem.innerHTML = `
            <div class="nav-title">${chapterName} <span>&#9660;</span></div>
            <div class="sub-nav" style="display: none;">
                ${subNavItems}
            </div>
        `;

        sidebar.appendChild(navItem);
    }

    const navTitles = document.querySelectorAll('.nav-title');
    navTitles.forEach(title => {
        title.addEventListener('click', () => {
            const subNav = title.nextElementSibling;
            subNav.style.display = subNav.style.display === "none" ? "block" : "none";
        });
    });

    const subNavItems = document.querySelectorAll('.sub-nav-item');
    subNavItems.forEach(item => {
        item.addEventListener('click', function() {
            const lectureID = this.getAttribute('data-lecture-id');
            console.log(`Fetching video for lecture ID: ${lectureID}`);
            setVideo(lectureID);
            subNavItems.forEach(item => item.style.fontWeight = 'normal');
            this.style.fontWeight = 'bold';
        });
    });

    if (lectures.length > 0) {
        const firstLectureID = lectures[0].LectureID;
        console.log(`Setting video for the first lecture: ${firstLectureID}`);
        setVideo(firstLectureID);
    }
}

async function setVideo(lectureID) {
    const videoIframe = document.querySelector('.main-content iframe');

    try {
        const response = await fetch(`/video/${lectureID}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        videoIframe.src = videoUrl;
    } catch (error) {
        console.error('Error setting video:', error);
    }
}

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

async function deleteReview(button) {
    const review = button.closest('.review');
    const reviewId = review.getAttribute('data-id');
    const userId = sessionStorage.getItem('userId');

    console.log(`Attempting to delete review with ID: ${reviewId} by user ID: ${userId}`);

    try {
        const response = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId }) // Include userId in the body
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
    const userId = sessionStorage.getItem('userId'); 

    if (!reviewText || !rating || !userId) {
        alert('Please log in or sign up to add reviews.');
        return;
    }

    fetch('http://localhost:3000/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ review_text: reviewText, rating: rating, userId: userId })
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
    const reviewUserId = parseInt(review.dataset.userId, 10);
    const currentUserId = parseInt(sessionStorage.getItem('userId'), 10);

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

        fetch(`http://localhost:3000/reviews/${review.getAttribute('data-id')}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ review_text: updatedText, rating: updatedRating, userId: currentUserId })
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
    fetch('http://localhost:3000/reviews')
        .then(response => response.json())
        .then(reviews => {
            const reviewsContainer = document.getElementById('reviews');
            reviewsContainer.innerHTML = '';

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
