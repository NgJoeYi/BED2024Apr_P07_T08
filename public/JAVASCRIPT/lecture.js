document.addEventListener('DOMContentLoaded', () => {
    getLecturesByCourse();   
    // Calls getLecturesByCourse function once the DOM content is fully loaded.
});

// Getting the lectures under the specific course 
async function getLecturesByCourse() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseID = urlParams.get('courseID');

    if (!courseID) {
        console.error('No course ID found in URL.');
        return;
        // Logs an error if the courseID is not found in the URL and exits the function.
    }

    try {
        const response = await fetch(`/lectures/course/${courseID}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const lectures = await response.json();
        displayLectures(lectures);
        // Fetches lectures for the given courseID, then displays them using displayLectures.
    } catch (error) {
        console.error('Error fetching lectures:', error);
        // Logs any errors encountered while fetching lectures.
    }
}

// Allows user to delete a specific lecture if they have the permission to 
async function deleteLecture(button) {
    const lectureID = button.dataset.lectureId;
    const courseID = new URLSearchParams(window.location.search).get('courseID');

    const userConfirmed = confirm('Are you sure you want to delete this lecture?');
    if (!userConfirmed) {
        return;
        // Prompts the user for confirmation before proceeding with deletion.
    }

    try {
        const response = await fetchWithAuth(`/lectures/${lectureID}`, {
            method: 'DELETE'
        });
        if (response.status === 204) {
            alert('Lecture deleted successfully!');
            button.closest('.sub-nav-item').remove();

            const currentVideoLectureID = document.querySelector('.main-content iframe').dataset.lectureId;
            if (currentVideoLectureID === lectureID) {
                clearVideo();
            }

            const lecturesResponse = await fetch(`/lectures/course/${courseID}`);
            const lectures = await lecturesResponse.json();

            if (lectures.length === 0) {
                const deleteCourseResponse = await fetchWithAuth(`/courses/${courseID}`, {
                    method: 'DELETE'
                });
                if (deleteCourseResponse.ok) {
                    alert('Course deleted successfully!');
                    window.location.href = 'courses.html';
                } else {
                    console.error('Failed to delete course. Status:', deleteCourseResponse.status);
                    alert('Failed to delete the course.');
                }
            } else {
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

// Clears video playing in the container when the user deletes the lecture 
function clearVideo() {
    const videoIframe = document.querySelector('.main-content iframe');
    videoIframe.src = ''; // Clear the video source
    videoIframe.dataset.lectureId = ''; // Clear the data attribute
}

// Allows user to delete the entire chapter of the lecture if they have permission
async function deleteChapter(button) {
    const chapterName = button.dataset.chapterName;
    const courseID = new URLSearchParams(window.location.search).get('courseID');

    const userConfirmed = confirm('Are you sure you want to delete this chapter?');
    if (!userConfirmed) {
        return; 
        // Prompts the user for confirmation before proceeding with chapter deletion.
    }

    const lecturesResponse = await fetch(`/lectures/course/${courseID}`);
    const lectures = await lecturesResponse.json();
    const lectureIDs = lectures.filter(lecture => lecture.ChapterName === chapterName).map(lecture => lecture.LectureID);

    if (lectureIDs.length === 0) {
        alert(`No lectures found for chapter: ${chapterName}`);
        return;
        // Alerts if no lectures are found for the chapter and exits the function.
    }

    try {
        const response = await fetchWithAuth(`/lectures/course/${courseID}/chapter/${chapterName}`, {
            method: 'DELETE',
            body: JSON.stringify({ lectureIDs })
        });

        if (response.status === 204) {
            alert(`Chapter ${chapterName} deleted successfully!`);
            button.closest('.nav-item').remove();

            const remainingLecturesResponse = await fetch(`/lectures/course/${courseID}`);
            const remainingLectures = await remainingLecturesResponse.json();

            if (remainingLectures.length === 0) {
                const deleteCourseResponse = await fetchWithAuth(`/courses/${courseID}`, {
                    method: 'DELETE'
                });
                if (deleteCourseResponse.ok) {
                    alert('Course deleted successfully!');
                    window.location.href = 'courses.html';
                } else {
                    console.error('Failed to delete course. Status:', deleteCourseResponse.status);
                    alert('Failed to delete the course.');
                }
            } else {
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

// Populates details of the lectures in the lecture details container below the lecture video 
async function displayLectureDetails(lectureID) {
    try {
        const response = await fetch(`/lectures/lecture-details/${lectureID}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        document.getElementById('title').innerHTML = `<strong>Title:</strong> ${data.Title}`;
        document.getElementById('description').innerHTML = `<strong>Description:</strong> ${data.Description}`;
        document.getElementById('duration').innerHTML = `<strong>Duration:</strong> ${data.Duration}`;
        document.getElementById('createdAt').innerHTML = `<strong>Created At:</strong> ${data.CreatedAt}`;
        // Updates the HTML elements with the fetched lecture data.
    } catch (error) {
        console.error('Error fetching lecture details:', error);
        // Logs any errors encountered while fetching lecture details.
    }
}

// For the arrow icon at the navigation
function iconOrientation() {
    const rotateIcon = document.getElementById('rotate-icon');
    const subNav = rotateIcon.closest('.nav-item').querySelector('.sub-nav');

    rotateIcon.addEventListener('click', () => {
        rotateIcon.classList.toggle('rotate-down');
        subNav.classList.toggle('show');
        // Toggles the rotation of the icon and visibility of the sub-navigation on click.
    });
}

// Only when the arrow is rotated downwards will the sub navigation items show 
function toggleSubNav(event) {
    const rotateIcon = event.target;
    const subNav = rotateIcon.closest('.nav-item').querySelector('.sub-nav');
    rotateIcon.classList.toggle('rotate-down');
    subNav.classList.toggle('show');
    // Toggles the rotation of the icon and visibility of the sub-navigation items.
}

// Creating the HTML to display lectures and populate information on the navigation sidebar 
function displayLectures(lectures) {
    const userRole = sessionStorage.getItem('role');
    const sidebar = document.querySelector('.sidebar .nav');
    if (!sidebar) {
        console.error('Sidebar element not found.');
        return;
        // Logs an error if the sidebar element is not found and exits the function.
    }
    sidebar.innerHTML = ''; // Clears existing content

    const groupedLectures = {};

    lectures.forEach(lecture => {
        if (!groupedLectures[lecture.ChapterName]) {
            groupedLectures[lecture.ChapterName] = [];
        }
        groupedLectures[lecture.ChapterName].push(lecture);
        // Groups lectures by chapter name.
    });

    if (Object.keys(groupedLectures).length === 0) {
        window.location.href = 'courses.html';
        return;
        // Redirects to the courses page if no lectures are found.
    }

    for (const chapterName in groupedLectures) {
        const navItem = document.createElement('div');
        navItem.className = 'nav-item';

        const deleteChapterButton = userRole === 'lecturer'
            ? `<button class="delete-chapter" style="display:block;" data-chapter-name="${chapterName}" onclick="deleteChapter(this)">Delete Chapter</button>`
            : '';

        const subNavItems = groupedLectures[chapterName]
            .map(lecture => {
                const deleteButton = userRole === 'lecturer'
                    ? `<button class="delete-lecture" style="display:block;" data-lecture-id="${lecture.LectureID}" onclick="deleteLecture(this)">Delete</button>`
                    : '';
                const editButton = userRole === 'lecturer'
                    ? `<button class="edit-lecture" style="display:block;" data-lecture-id="${lecture.LectureID}" onclick="editLecture(this)">Edit</button>`
                    : '';

                return `
                    <div class="sub-nav-item" data-lecture-id="${lecture.LectureID}">
                        <h3>${lecture.Title}</h3>
                        <div class="button-container">
                            ${deleteButton}
                            ${editButton}
                        </div>
                    </div>
                `;
            }).join('');

        navItem.innerHTML = `
            <div class="nav-title">
                <h2>${chapterName}</h2>
                ${deleteChapterButton}
                <span class="rotate-icon fa-solid fa-caret-right" style="font-size:30px;"></span>
            </div>
            <div class="sub-nav">
                ${subNavItems}
            </div>
        `;
        sidebar.appendChild(navItem);
    }

    const rotateIcons = document.querySelectorAll('.rotate-icon');
    rotateIcons.forEach(icon => {
        icon.addEventListener('click', toggleSubNav);
        // Adds click event listeners to rotate icons.
    });

    const subNavItems = document.querySelectorAll('.sub-nav-item');
    subNavItems.forEach(item => {
        item.addEventListener('click', function () {
            const lectureID = this.getAttribute('data-lecture-id');
            displayLectureDetails(lectureID);
            setVideo(lectureID);
            subNavItems.forEach(item => item.style.fontWeight = 'normal');
            this.style.fontWeight = 'bold';
            // Adds click event listeners to sub-navigation items for displaying lecture details and setting video.
        });
    });
    if (lectures.length > 0) {
        const firstLectureID = lectures[0].LectureID;
        displayLectureDetails(firstLectureID);
        setVideo(firstLectureID);
    }
}

// For showing the lecture video 
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
        // Logs any errors encountered while setting the video.
    }
}

// Brings user to the edit lecture page if they have permission
async function editLecture(button) {
    const lectureID = button.dataset.lectureId;
    const courseID = new URLSearchParams(window.location.search).get('courseID');
    try {
        const checkingUserIDResponse = await fetchWithAuth(`/lectures/checking`);
        if (!checkingUserIDResponse.ok) {
            throw new Error('Network response not ok');
        }
        const { userID: userIDLoggedon } = await checkingUserIDResponse.json();
        console.log(userIDLoggedon,'HII');
        const response = await fetch(`/lectures/${lectureID}`);
        if (!response.ok) {
            throw new Error('Network response not ok');
        }
        const lecture = await response.json();
        const userIDInLecture = lecture.userID;

        if (userIDLoggedon === userIDInLecture) {
            window.location.href = `editLecture.html?courseID=${courseID}&lectureID=${lectureID}`;
        } else {
            alert('You do not have permission to edit this lecture.');
        }
    } catch (error) {
        console.error('Error getting lecture or user ID:', error);
        // Logs any errors encountered while checking user permission or getting lecture details.
    }
}
