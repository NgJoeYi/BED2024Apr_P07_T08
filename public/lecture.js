document.addEventListener('DOMContentLoaded', () => {
    getLecturesByCourse();

    const currentUserId = sessionStorage.getItem('userId');
    console.log('Current User ID:', currentUserId); // Debug log

    const navTitles = document.querySelectorAll('.nav-title');
    navTitles.forEach(title => {
        title.addEventListener('click', () => {
            const subNav = title.nextElementSibling;
            subNav.style.display = subNav.style.display === "none" || subNav.style.display === "" ? "block" : "none";
        });
    });

    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    hamburger.addEventListener('click', () => {
        sidebar.style.width = sidebar.style.width === "250px" || sidebar.style.width === "" ? "60px" : "250px";
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.display = sidebar.style.width === "250px" ? 'block' : 'none';
        });
    });
});

async function deleteLecture(button) {
    const lectureID = button.dataset.lectureId;
    const courseID = new URLSearchParams(window.location.search).get('courseID');

    if (!confirm('Are you sure you want to delete this lecture?')) {
        return;
    }

    try {
        const response = await fetch(`/lectures/${lectureID}`, { method: 'DELETE' });

        if (response.ok) {
            alert('Lecture deleted successfully!');
            button.closest('.sub-nav-item').remove();

            // Clear video if the deleted lecture is currently playing
            const currentVideoLectureID = document.querySelector('.main-content iframe').dataset.lectureId;
            if (currentVideoLectureID === lectureID) {
                clearVideo();
            }

            // Check if there are any remaining lectures for the course
            const lecturesResponse = await fetch(`/lectures/course/${courseID}`);
            const lectures = await lecturesResponse.json();

            if (lectures.length === 0) {
                // No more lectures, delete the course
                const deleteCourseResponse = await fetch(`/courses/${courseID}`, { method: 'DELETE' });
                if (deleteCourseResponse.ok) {
                    alert('Course deleted successfully!');
                    window.location.href = 'courses.html';
                } else {
                    console.error('Failed to delete course. Status:', deleteCourseResponse.status);
                }
            } else {
                // If there are remaining lectures, reload them
                getLecturesByCourse();
            }
        } else {
            console.error('Failed to delete lecture. Status:', response.status);
            alert('Failed to delete the lecture.');
        }
    } catch (error) {
        console.error('Error deleting lecture:', error);
        alert('Error deleting lecture.');
    }
}

async function deleteChapter(button) {
    const chapterName = button.dataset.chapterName;
    const courseID = new URLSearchParams(window.location.search).get('courseID');

    if (!confirm(`Are you sure you want to delete the entire chapter: ${chapterName}?`)) {
        return;
    }

    try {
        const response = await fetch(`/lectures/course/${courseID}/chapter/${chapterName}`, { method: 'DELETE' });

        if (response.ok) {
            alert(`Chapter ${chapterName} deleted successfully!`);
            button.closest('.nav-item').remove();

            // Check if there are any remaining lectures for the course
            const lecturesResponse = await fetch(`/lectures/course/${courseID}`);
            const lectures = await lecturesResponse.json();

            if (lectures.length === 0) {
                // No more lectures, delete the course
                const deleteCourseResponse = await fetch(`/courses/${courseID}`, { method: 'DELETE' });
                if (deleteCourseResponse.ok) {
                    alert('Course deleted successfully!');
                    window.location.href = 'courses.html';
                } else {
                    console.error('Failed to delete course. Status:', deleteCourseResponse.status);
                }
            } else {
                // If there are remaining lectures, reload them
                getLecturesByCourse();
            }
        } else {
            console.error('Failed to delete chapter. Status:', response.status);
            alert('Failed to delete the chapter.');
        }
    } catch (error) {
        console.error('Error deleting chapter:', error);
        alert('Error deleting chapter.');
    }
}

function clearVideo() {
    const videoIframe = document.querySelector('.main-content iframe');
    videoIframe.src = ''; // Clear the video source
    videoIframe.dataset.lectureId = ''; // Clear the data attribute
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
        if (!response.ok) throw new Error('Network response was not ok');
        const lectures = await response.json();
        console.log('Fetched lectures:', lectures);
        displayLectures(lectures);
    } catch (error) {
        console.error('Error fetching lectures:', error);
    }
}

function displayLectures(lectures) {
    const sidebar = document.querySelector('.sidebar .nav');
    sidebar.innerHTML = ''; // Clear existing content

    const groupedLectures = {};

    lectures.forEach(lecture => {
        if (!groupedLectures[lecture.ChapterName]) {
            groupedLectures[lecture.ChapterName] = [];
        }
        groupedLectures[lecture.ChapterName].push(lecture);
    });

    console.log('Grouped Lectures:', groupedLectures);

    const userRole = sessionStorage.getItem('role'); // Get user role
    console.log('USER ROLE:', userRole);

    // Check if there are any lectures
    if (Object.keys(groupedLectures).length === 0) {
        window.location.href = 'courses.html';
        return;
    }

    for (const chapterName in groupedLectures) {
        const navItem = document.createElement('div');
        navItem.className = 'nav-item';

        const deleteChapterButton = 
            userRole === 'lecturer'
            ? `<button class="delete-chapter" style="display:block;" data-chapter-name="${chapterName}" onclick="deleteChapter(this)">Delete Chapter</button>` 
            : '';

        const subNavItems = groupedLectures[chapterName]
            .map(lecture => {
                const deleteButton = 
                    userRole === 'lecturer'
                    ? `<button class="delete-lecture" style="display:block;" data-lecture-id="${lecture.LectureID}" onclick="deleteLecture(this)">Delete</button>` 
                    : '';
                const editButton = 
                    userRole === 'lecturer'
                    ? `<button class="edit-lecture" style="display:block;" data-lecture-id="${lecture.LectureID}" onclick="editLecture(this)">Edit</button>`
                    : '';
    
                return `
                    <div class="sub-nav-item" data-lecture-id="${lecture.LectureID}">
                        ${lecture.Title}
                        ${deleteButton}
                        ${editButton}
                    </div>
                `;
            }).join('');

        console.log('Generated HTML:', subNavItems);

        navItem.innerHTML = `
            <div class="nav-title">
                ${chapterName}
                <span>&#9660;</span>
                ${deleteChapterButton}
            </div>
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
        videoIframe.dataset.lectureId = lectureID; // Set the data attribute
    } catch (error) {
        console.error('Error setting video:', error);
    }
}

async function editLecture(button) {
    const lectureID = button.dataset.lectureId;
    const courseID = new URLSearchParams(window.location.search).get('courseID');

    // Redirect to edit lecture page with lectureID and courseID as query parameters
    window.location.href = `editLecture.html?courseID=${courseID}&lectureID=${lectureID}`;
}
// EDIT LECTURE
document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const lectureID = urlParams.get('lectureID');
    const courseID = urlParams.get('courseID');
    const userID = sessionStorage.getItem('userId');
    console.log('USER ID UPDATE LECTURE: ', userID);

    if (lectureID && courseID) {
        try {
            const response = await fetch(`/lectures/${lectureID}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const lecture = await response.json();
            console.log('Fetched lecture:', lecture);
            populateLectureDetails(lecture);
        } catch (error) {
            console.error('Error fetching lecture details:', error);
        }
    }

    const form = document.getElementById('edit-lecture-form');
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append('title', document.getElementById('lectureTitle').value);
        formData.append('description', document.getElementById('lectureDescription').value);
        formData.append('chapterName', document.getElementById('lectureChapterName').value);
        formData.append('duration', document.getElementById('lectureDuration').value);
        const lectureImageInput = document.getElementById('lectureImageInput');
        const lectureVideoInput = document.getElementById('lectureVideoInput');

        if (lectureImageInput.files.length > 0) {
            formData.append('lectureImage', lectureImageInput.files[0]);
        }
        if (lectureVideoInput.files.length > 0) {
            formData.append('lectureVideo', lectureVideoInput.files[0]);
        }
        formData.append('userID', sessionStorage.getItem('userId'));

        // Log form data before sending
        console.log('Form Data:', Object.fromEntries(formData.entries()));

        try {
            const response = await fetch(`/lectures/${lectureID}`, {
                method: 'PUT',
                body: formData
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            alert('Lecture updated successfully!');
            window.location.href = `lecture.html?courseID=${courseID}`;
        } catch (error) {
            console.error('Error updating lecture:', error);
            alert('Error updating lecture.');
        }
    });
});

function populateLectureDetails(lecture) {
    console.log('Populating lecture details:', lecture); // Debug log

    document.getElementById('lectureTitle').value = lecture.title || '';
    document.getElementById('lectureDescription').value = lecture.description || '';
    document.getElementById('lectureChapterName').value = lecture.chapterName || '';
    document.getElementById('lectureDuration').value = lecture.duration || '';

    const lectureImageElement = document.getElementById('lectureImage');
    const lectureImageInputElement = document.getElementById('lectureImageInput');

    if (lectureImageElement && lecture.lectureImage) {
        const imageUrl = `/lectures/image/${lecture.lectureID}`;
        lectureImageElement.src = imageUrl;
        lectureImageElement.alt = "Lecture Image";
        lectureImageElement.style.display = 'block';
        lectureImageInputElement.value = '';
    } else {
        lectureImageElement.style.display = 'none';
    }

    const lectureVideoElement = document.getElementById('lectureVideo');
    const lectureVideoInputElement = document.getElementById('lectureVideoInput');

    if (lectureVideoElement && lecture.video) {
        const videoUrl = `/video/${lecture.lectureID}`;
        lectureVideoElement.src = videoUrl;
        lectureVideoElement.controls = true;
        lectureVideoElement.style.display = 'block';
        lectureVideoInputElement.value = '';
    } else {
        lectureVideoElement.style.display = 'none';
    }
}
