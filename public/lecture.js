document.addEventListener('DOMContentLoaded', () => {
    fetchReviews();
    getLecturesByCourse();

    const currentUserId = sessionStorage.getItem('userId'); 
    console.log('Current User ID:', currentUserId);

    document.getElementById('sort').value = 'mostRecent';
    sortReviews();
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
