document.addEventListener('DOMContentLoaded', () => {
    // Navigation bar interaction
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

    // Review stars interaction
    const reviewStars = document.querySelectorAll('.review .fa-star');
    reviewStars.forEach(star => {
        star.addEventListener('click', () => {
            const value = star.getAttribute('data-value');
            const parent = star.closest('.rating');
            const stars = parent.querySelectorAll('.fa-star');
            if (star.classList.contains('selected') && value === '1') {
                // If the first star is clicked twice, deselect all stars
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

    // Popup stars interaction
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
                // If the first star is clicked twice, deselect all stars
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

    // Set default sort option to "mostRecent" and sort reviews
    document.getElementById('sort').value = 'mostRecent'; // Set default value
    sortReviews(); // Sort reviews by most recent on page load
});

function showPopup(type) {
    const popup = document.getElementById('popup');
    const popupContent = popup.querySelector('.popup-content h2');
    popupContent.textContent = type === 'add' ? 'Leave a Review' : 'Edit Review';
    popup.style.display = 'flex';
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

function editReview(button) {
    showPopup('edit');
}

function postReview() {
    closePopup();
}

