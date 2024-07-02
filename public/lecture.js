document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display reviews
    fetchReviews();
    getLecturesByCourse();

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
    const userId = sessionStorage.getItem('userId'); // Get the current user ID from session storage

    if (!reviewText || !rating || !userId) {
        alert('Please log in or sign up to add reviews.');
        return;
    }

    fetch('http://localhost:3000/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ review_text: reviewText, rating: rating, userId: userId }) // Include userId
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

        fetch(`http://localhost:3000/reviews/${review.getAttribute('data-id')}`, {
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
    fetch('http://localhost:3000/reviews')
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

// Fetch the last chapter name for a specific user
async function fetchLastChapterName() {
    const userID = sessionStorage.getItem('userId'); 
    console.log("Fetching chapter for user ID:", userID);
    if (!userID) {
        console.error("User ID not found in sessionStorage.");
        return null; 
    }
    console.log('USER ID: ',userID);
    try {
        const response = await fetch(`/lectures/last-chapter/${userID}`);
        if (response.ok) {
            const data = await response.json();
            console.log("Fetched last chapter name:", data.chapterName);
            return data.chapterName;
        } else {
            console.error("Failed to fetch last chapter name. Status:", response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching last chapter name:', error);
        return null;
    }
}

// Fetch the max course ID from the server
async function fetchMaxCourseID() {
    try {
        const response = await fetch('/lectures/max-course-id');
        if (response.ok) {
            const data = await response.json();
            return data.maxCourseID;
        } else {
            console.error("Failed to fetch max course ID. Status:", response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching max course ID:', error);
        return null;
    }
}

// Function to add files
async function addFiles() {
    const previousChapterName = await fetchLastChapterName();
    const chapterNameInput = document.getElementById('chapterName').value.trim();
    const title = document.getElementById('lectureName').value.trim();
    const duration = document.getElementById('duration-lecture').value.trim();
    const description = document.getElementById('description').value.trim();
    const videoFileInput = document.getElementById('videoFiles');
    const imageFileInput = document.getElementById('lectureImage');

    console.log("Chapter Name Input:", chapterNameInput);
    console.log("Title:", title);
    console.log("Duration:", duration);
    console.log("Description:", description);

    const userID = sessionStorage.getItem('userId');
    const courseID = await fetchMaxCourseID();

    console.log("userID from Session:", userID);
    console.log("courseID from Input:", courseID);

    if (!userID) {
        alert('User ID not found. Please log in again.');
        return;
    }

    if (!courseID) {
        alert('Course ID not found. Please select a course.');
        return;
    }

    if (!title || !duration || !description || videoFileInput.files.length === 0 || imageFileInput.files.length === 0) {
        alert('Please fill in all fields and select at least one file.');
        return;
    }

    let chapterName = chapterNameInput || previousChapterName;
    console.log('Final Chapter Name to Use:', chapterName);
    if (!chapterName) {
        alert('Please enter a chapter name.');
        return;
    }

    const formData = new FormData();
    formData.append('UserID', userID);
    formData.append('CourseID', courseID);
    formData.append('ChapterName', chapterName);
    formData.append('Title', title);
    formData.append('Duration', duration);
    formData.append('Description', description);
    Array.from(videoFileInput.files).forEach(file => formData.append('Video', file));
    Array.from(imageFileInput.files).forEach(file => formData.append('LectureImage', file));

    try {
        const response = await fetch('/lectures', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const newLecture = await response.json();
            displayNewLecture(newLecture, videoFileInput.files, imageFileInput.files);
            closeModal();
            console.log("Lecture added successfully");
        } else {
            throw new Error('Failed to save the lecture');
        }
    } catch (error) {
        console.error('Error saving the lecture:', error);
        alert('Error saving the lecture.');
    }
}

function displayNewLecture(newLecture, videoFiles, imageFiles) {
    const courseArrangement = document.getElementById('course-arrangement');

    const newChapterDiv = document.createElement('div');
    newChapterDiv.className = 'chapter';
    newChapterDiv.contentEditable = 'false';

    const chapterNameElement = document.createElement('div');
    chapterNameElement.className = 'chapter-name';
    chapterNameElement.innerHTML = `
        <p contenteditable="true" class="editable-placeholder">Chapter Name: ${newLecture.ChapterName}</p>
        <span class="delete-chapter-icon" onclick="removeChapter(this)">
            <i class="fa-solid fa-x" style="color: #ff3838;"></i>
        </span>
    `;

    const lectureDetails = document.createElement('div');
    lectureDetails.className = 'lecture-details';
    lectureDetails.innerHTML = `
        <p>Lecture Name: ${newLecture.Title}</p>
        <p>Duration: ${newLecture.Duration} minutes</p>
        <p>Description: ${newLecture.Description}</p>
    `;

    const imageFile = imageFiles[0];
    const imageURL = URL.createObjectURL(imageFile);
    const imageElement = document.createElement('img');
    imageElement.src = imageURL;
    imageElement.alt = 'Lecture Image';
    imageElement.width = 200;
    imageElement.height = 200;
    lectureDetails.appendChild(imageElement);

    const videoFileNames = Array.from(videoFiles).map(file => file.name).join(', ');
    const videoElement = document.createElement('p');
    videoElement.textContent = `Lecture Video: ${videoFileNames}`;
    lectureDetails.appendChild(videoElement);

    newChapterDiv.appendChild(chapterNameElement);
    newChapterDiv.appendChild(lectureDetails);

    courseArrangement.insertBefore(newChapterDiv, courseArrangement.querySelector('.new-btn-container'));

    resetForm();
}

function resetForm() {
    document.getElementById('chapterName').value = '';
    document.getElementById('lectureName').value = '';
    document.getElementById('duration').value = '';
    document.getElementById('description').value = '';
    document.getElementById('videoFiles').value = '';
    document.getElementById('lectureImage').value = '';
    console.log("Form reset completed");
}

async function addCourses() {
    const userID = sessionStorage.getItem('userId');
    const title = document.getElementById('course-name-text').textContent.trim();
    const description = document.getElementById('course-details').textContent.trim();
    const category = document.getElementById('category').value.trim();
    const level = document.getElementById('level').value.trim();
    const duration = document.getElementById('duration').value.trim();
    const courseImageInput = document.getElementById('imageFile');
    const courseArrangement = document.getElementById('course-arrangement');

    if (!userID || !title || !description || !category || !level || !duration || courseImageInput.files.length === 0) {
        alert('Please complete entering course information and select an image.');
        return;
    }

    const chapters = courseArrangement.querySelectorAll('.chapter');
    if (chapters.length === 0) {
        alert('Please add at least one lecture before submitting the course.');
        return;
    }

    const formData = new FormData();
    formData.append('userID', userID);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('level', level);
    formData.append('duration', duration);
    formData.append('imageFile', courseImageInput.files[0]); // Ensure this matches the form field name

    try {
        const response = await fetch('/courses', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const newCourse = await response.json();
            alert('Course saved successfully');
            window.location.href = 'Courses.html'; // Redirect on successful creation
        } else {
            const errorData = await response.json();
            alert(`Failed to save the course: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error saving the course:', error);
        alert('Error saving the course.');
    }

    // Show the lectures arrangement section and hide submit and cancel buttons
    document.getElementById('course-arrangement').style.display = 'block';
    document.querySelector('.button-container').style.display = 'none';
}
