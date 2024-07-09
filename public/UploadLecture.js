document.addEventListener('DOMContentLoaded', () => {
    // Other initialization code
    // Fetch and display reviews and lectures
});

function triggerFileUpload() {
    document.getElementById('newFileModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('newFileModal').style.display = 'none';
}

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
    console.log("userID from Session:", userID);

    if (!userID) {
        alert('User ID not found. Please log in again.');
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

    try {
        // Fetch the max course ID
        const courseIDResponse = await fetch('/lectures/max-course-id');
        const courseIDData = await courseIDResponse.json();
        const courseID = courseIDData.maxCourseID;
        console.log("courseID from Server:", courseID);

        const formData = new FormData();
        formData.append('UserID', userID);
        formData.append('CourseID', courseID);
        formData.append('ChapterName', chapterName);
        formData.append('Title', title);
        formData.append('Duration', duration);
        formData.append('Description', description);
        Array.from(videoFileInput.files).forEach(file => formData.append('Video', file));
        Array.from(imageFileInput.files).forEach(file => formData.append('LectureImage', file));

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
    const token = sessionStorage.getItem('token');  // Retrieve the JWT token from sessionStorage
    if (!token) {
        alert('User not authenticated. Please log in.');
        return;
    }

    const title = document.getElementById('course-name-text').textContent.trim();
    const description = document.getElementById('course-details').textContent.trim();
    const category = document.getElementById('category').value.trim();
    const level = document.getElementById('level').value.trim();
    const duration = document.getElementById('duration').value.trim();
    const courseImageInput = document.getElementById('imageFile');

    if (!title || !description || !category || !level || !duration || courseImageInput.files.length === 0) {
        alert('Please complete entering course information and select an image.');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('level', level);
    formData.append('duration', duration);
    formData.append('imageFile', courseImageInput.files[0]);

    try {
        const response = await fetch('/courses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`  // Include the JWT token in the Authorization header
            },
            body: formData
        });

        if (response.ok) {
            const newCourse = await response.json();
            alert('Course saved successfully');
            document.getElementById('course-arrangement').style.display = 'block';
            document.getElementById('submit-button').style.display = 'none';
            document.getElementById('cancel-button').style.display = 'none';
        } else {
            const errorData = await response.json();
            alert(`Failed to save the course: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error saving the course:', error);
        alert('Error saving the course.');
    }
}

async function cancelCourse() {
    if (confirm(`Are you sure you want to stop creating course?`)) {
        window.location.href = 'courses.html';
        try {
            const response = await fetch(`/courses/${courseID}`, {
                method: 'DELETE'
            });
            console.log('PASSED HERE ');
            if (response.ok) {
                if (response.status === 204) {
                    alert('Course deleted successfully!');
                    button.closest('.course-cd-unique').remove(); // Remove the course element from the DOM
                } else {
                    const result = await response.json();
                    alert(result.message);
                    button.closest('.course-cd-unique').remove(); // Remove the course element from the DOM
                }
            } else {
                const errorData = await response.json();
                console.error('Failed to delete course. Status:', response.status, 'Message:', errorData.message);
                alert('Failed to delete the course. ' + errorData.message);
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Error deleting course.');
        }
    
        return;
    }
}
