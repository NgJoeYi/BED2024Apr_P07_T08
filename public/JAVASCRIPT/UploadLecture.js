function triggerFileUpload() {
    document.getElementById('newFileModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('newFileModal').style.display = 'none';
}

async function fetchLastChapterName() {
    const token = sessionStorage.getItem('token');  // Retrieve the JWT token from sessionStorage
    if (!token) {
        alert('User not authenticated. Please log in.');
        return;
    }
    try {
        const response = await fetch(`/lectures/last-chapter`,{
            headers: {
                'Authorization': `Bearer ${token}`  // Include the JWT token in the Authorization header
            }
        });
        if (response.ok) {
            const data = await response.json();
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

// UPLOAD LECTURES
async function addFiles() {
    const token = sessionStorage.getItem('token');  // Retrieve the JWT token from sessionStorage
    if (!token) {
        alert('User not authenticated. Please log in.');
        return;
    }

    const previousChapterName = await fetchLastChapterName();
    const chapterNameInput = document.getElementById('chapterName').value.trim();
    const title = document.getElementById('lectureName').value.trim();
    const duration = document.getElementById('duration-lecture').value.trim();
    const description = document.getElementById('description').value.trim();
    const videoFileInput = document.getElementById('videoFiles');

    console.log("Chapter Name Input:", chapterNameInput);
    console.log("Title:", title);
    console.log("Duration:", duration);
    console.log("Description:", description);

    if (!title || !duration || !description || videoFileInput.files.length === 0 ) {
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
        if (!courseIDResponse.ok) {
            throw new Error('Failed to fetch max course ID');
        }
        const courseIDData = await courseIDResponse.json();
        const courseID = courseIDData.maxCourseID;
        console.log("courseID from Server:", courseID); // Ensure this logs

        const formData = new FormData();
        formData.append('CourseID', courseID);
        formData.append('ChapterName', chapterName);
        formData.append('Title', title);
        formData.append('Duration', duration);
        formData.append('Description', description);
        Array.from(videoFileInput.files).forEach(file => formData.append('Video', file));

        const response = await fetch('/lectures', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`  // Include the JWT token in the Authorization header
            },
            body: formData
        });

        if (response.ok) {
            const newLecture = await response.json();
            displayNewLecture(newLecture, videoFileInput.files);
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


function displayNewLecture(newLecture, videoFiles) {
    const courseArrangement = document.getElementById('course-arrangement');

    const newChapterDiv = document.createElement('div');
    newChapterDiv.className = 'chapter';
    newChapterDiv.contentEditable = 'false';

    const lectureDetails = document.createElement('div');
    lectureDetails.className = 'lecture-details';
    lectureDetails.innerHTML = `
        <p>Chapter Name : ${newLecture.ChapterName}</p>
        <p>Lecture Name: ${newLecture.Title}</p>
        <p>Duration: ${newLecture.Duration} minutes</p>
        <p>Description: ${newLecture.Description}</p>
    `;

    const videoFileNames = Array.from(videoFiles).map(file => file.name).join(', ');
    const videoElement = document.createElement('p');
    videoElement.textContent = `Lecture Video: ${videoFileNames}`;
    lectureDetails.appendChild(videoElement);

    newChapterDiv.appendChild(lectureDetails);

    courseArrangement.insertBefore(newChapterDiv, courseArrangement.querySelector('.new-btn-container'));

    resetForm();
}

function resetForm() {
    document.getElementById('chapterName').value = '';
    document.getElementById('lectureName').value = '';
    document.getElementById('duration-lecture').value = '';
    document.getElementById('description').value = '';
    document.getElementById('videoFiles').value = '';
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
            makeFieldsUneditable();
            document.getElementById('course-arrangement').style.display = 'block';
            // document.getElementById('submit-button').style.display = 'none';
            // document.getElementById('cancel-button').style.display = 'none';
           
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
        alert('Course deleted successfully!');
        window.location.href = 'courses.html';
      return;
    }
}

function makeFieldsUneditable() {
    document.getElementById('level').setAttribute('disabled', 'disabled');
    document.getElementById('duration').setAttribute('disabled', 'disabled');
    document.getElementById('category').setAttribute('disabled', 'disabled');
    document.getElementById('imageFile').setAttribute('disabled', 'disabled');
    document.getElementById('submit-button').style.display = 'none';
    document.getElementById('cancel-button').style.display = 'none';

    // Make course name and description uneditable
    document.getElementById('course-name-text').setAttribute('contenteditable', 'false');
    document.getElementById('course-details').setAttribute('contenteditable', 'false');
}


