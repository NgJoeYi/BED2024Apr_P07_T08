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
        displayLectures(lectures);
    } catch (error) {
        console.error('Error fetching lectures:', error);
    }
}

function clearVideo() {
    const videoIframe = document.querySelector('.main-content iframe');
    videoIframe.src = ''; // Clear the video source
    videoIframe.dataset.lectureId = ''; // Clear the data attribute
}

async function deleteLecture(button) {
    const lectureID = button.dataset.lectureId;
    const courseID = new URLSearchParams(window.location.search).get('courseID');
    const token = sessionStorage.getItem('token');

    // Confirmation dialog
    const userConfirmed = confirm('Are you sure you want to delete this lecture?');
    if (!userConfirmed) {
        return; 
    }
    try {
        const response = await fetch(`/lectures/${lectureID}`, { 
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.status === 204) {
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
                const deleteCourseResponse = await fetch(`/courses/${courseID}`, { 
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (deleteCourseResponse.ok) {
                    alert('Course deleted successfully!');
                    window.location.href = 'courses.html';
                } else {
                    console.error('Failed to delete course. Status:', deleteCourseResponse.status);
                    alert('Failed to delete the course.');
                }
            } else {
                // There are remaining lectures, update UI or redirect as needed
                window.location.href = `lecture.html?courseID=${courseID}`;
            }
        } else if (response.status === 403) {
            alert('You do not have permission to delete this lecture.');
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

    const token = sessionStorage.getItem('token');  // Retrieve the JWT token from sessionStorage
    if (!token) {
        alert('User not authenticated. Please log in.');
        return;
    }
    // Confirmation dialog
    const userConfirmed = confirm('Are you sure you want to delete this lecture?');
    if (!userConfirmed) {
        return; 
    }
    // Collect all lecture IDs under the chapter
    const lecturesResponse = await fetch(`/lectures/course/${courseID}`);
    const lectures = await lecturesResponse.json();
    const lectureIDs = lectures.filter(lecture => lecture.ChapterName === chapterName).map(lecture => lecture.LectureID);

    if (lectureIDs.length === 0) {
        alert(`No lectures found for chapter: ${chapterName}`);
        return;
    }

    try {
        const response = await fetch(`/lectures/course/${courseID}/chapter/${chapterName}`, { 
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lectureIDs })  // Send lecture IDs in the request body
        });

        if (response.status === 204) {
            alert(`Chapter ${chapterName} deleted successfully!`);
            button.closest('.nav-item').remove();

            // Check if there are any remaining lectures for the course
            const remainingLecturesResponse = await fetch(`/lectures/course/${courseID}`);
            const remainingLectures = await remainingLecturesResponse.json();

            if (remainingLectures.length === 0) {
                // No more lectures, delete the course
                const deleteCourseResponse = await fetch(`/courses/${courseID}`, { 
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (deleteCourseResponse.ok) {
                    alert('Course deleted successfully!');
                    window.location.href = 'courses.html';
                } else {
                    console.error('Failed to delete course. Status:', deleteCourseResponse.status);
                    alert('Failed to delete the course.');
                }
            } else {
                // If there are remaining lectures, reload them
                getLecturesByCourse();
                window.location.href = `lecture.html?courseID=${courseID}`;
            }
        } else if (response.status === 403) {
            alert('You do not have permission to delete this lecture chapter.');
        } else {
            console.error('Failed to delete chapter. Status:', response.status);
            alert('Failed to delete the chapter.');
        }
    } catch (error) {
        console.error('Error deleting chapter:', error);
        alert('Error deleting chapter.');
    }
}


function displayLectures(lectures) {
    const userRole = sessionStorage.getItem('role');
    const token = sessionStorage.getItem('token');

    const sidebar = document.querySelector('.sidebar .nav');
    if (!sidebar) {
        console.error('Sidebar element not found.');
        return;
    }
    sidebar.innerHTML = ''; // Clear existing content

    const groupedLectures = {};

    lectures.forEach(lecture => {
        if (!groupedLectures[lecture.ChapterName]) {
            groupedLectures[lecture.ChapterName] = [];
        }
        groupedLectures[lecture.ChapterName].push(lecture);
    });

    // Check if there are any lectures
    if (Object.keys(groupedLectures).length === 0) {
        window.location.href = 'courses.html';
        return;
    }

    for (const chapterName in groupedLectures) {
        const navItem = document.createElement('div');
        navItem.className = 'nav-item';

        const deleteChapterButton = 
            token && userRole === 'lecturer'
            ? `<button class="delete-chapter" style="display:block;" data-chapter-name="${chapterName}" onclick="deleteChapter(this)">Delete Chapter</button>` 
            : '';

        const subNavItems = groupedLectures[chapterName]
            .map(lecture => {
                const deleteButton = 
                     token && userRole === 'lecturer'
                    ? `<button class="delete-lecture" style="display:block;" data-lecture-id="${lecture.LectureID}" onclick="deleteLecture(this)">Delete</button>` 
                    : '';
                const editButton = 
                     token && userRole === 'lecturer'
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
            setVideo(lectureID);
            subNavItems.forEach(item => item.style.fontWeight = 'normal');
            this.style.fontWeight = 'bold';
        });
    });

    if (lectures.length > 0) {
        const firstLectureID = lectures[0].LectureID;
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
    // Getting user ID of lecture 
    const lectureID = button.dataset.lectureId;
    const courseID = new URLSearchParams(window.location.search).get('courseID');
    const token = sessionStorage.getItem('token');
    try {
        // Getting user ID of logged on now 
        const checkingUserIDResponse = await fetch(`/lectures/checking`,{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!checkingUserIDResponse.ok) {
            throw new Error('Network response not ok');
        }
        const { userID: userIDLoggedon } = await checkingUserIDResponse.json();
        console.log('Logged-on user ID:', userIDLoggedon);

        const response = await fetch(`/lectures/${lectureID}`);
        if (!response.ok) {
            throw new Error('Network response not ok');
        }
        const lecture = await response.json();
        const userIDInLecture = lecture.userID;
        console.log('Lecture user ID:', userIDInLecture);

        if (userIDLoggedon === userIDInLecture) {
            // Redirect to edit lecture page with lectureID and courseID as query parameters
            window.location.href = `editLecture.html?courseID=${courseID}&lectureID=${lectureID}`;
        } else {
            alert('You do not have permission to edit this lecture.');
        }
    } catch (error) {
        console.error('Error getting lecture or user ID:', error);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    getLecturesByCourse();

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


