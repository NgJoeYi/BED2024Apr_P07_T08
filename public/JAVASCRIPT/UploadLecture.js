function triggerFileUpload() {
    document.getElementById('newFileModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('newFileModal').style.display = 'none';
}

// so user can add multiple lectures under the same chapter name asa the previous 
async function fetchLastChapterName() {
    try {
        const response = await fetchWithAuth(`/lectures/last-chapter`); // ------------------------------------------------- headers in jwtutility.js
        if (!response) return; // ********************** jwt
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
async function addLecture() {
    const title = document.getElementById('lectureName').value.trim();
    const duration = document.getElementById('duration-lecture').value.trim();
    const description = document.getElementById('description').value.trim();
    const videoFileInput = document.getElementById('videoFiles');
    const chapterName = document.getElementById('chapterName').value.trim();

    if (!title || !duration || !description || videoFileInput.files.length === 0) {
        alert('Please fill in all fields and select a video file.');
        return;
    }

    // Check if the video filename contains spaces
    const videoFile = videoFileInput.files[0];
    if (videoFile && videoFile.name.includes(' ')) {
        alert('The video filename should not contain spaces. Please rename your file and try again.');
        videoFileInput.value = ''; // Clear the file input
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('duration', duration);
    formData.append('description', description);
    formData.append('chapterName', chapterName); // Adding chapterName
    formData.append('video', videoFileInput.files[0]);

    try {
        // Fetch the max course ID
        const courseIDResponse = await fetchWithAuth('/lectures/max-course-id');
        if (!courseIDResponse.ok) {
            throw new Error('Failed to fetch max course ID');
        }
        const courseIDData = await courseIDResponse.json();
        const courseID = courseIDData.maxCourseID;
        console.log("courseID", courseID); // Ensure this logs

        formData.append('courseID', courseID); // Append courseID to FormData

        // Log FormData entries
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        const response = await fetchWithAuth('/lectures', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Failed to upload lecture: ${errorData.message}`);
            return;
        }

        const newLecture = await response.json();
        alert('Lecture uploaded successfully');
        displayNewLecture(newLecture, videoFileInput.files);
        closeModal();
    } catch (error) {
        console.error('Error uploading lecture:', error);
        alert('Error uploading lecture.');
    }
}

// generates html code to display the lecture 
function displayNewLecture(newLecture, videoFiles) {
    const courseArrangement = document.getElementById('course-arrangement');

    const newChapterDiv = document.createElement('div');
    newChapterDiv.className = 'chapter';
    newChapterDiv.contentEditable = 'false';

    const lectureDetails = document.createElement('div');
    lectureDetails.className = 'lecture-details';
    lectureDetails.innerHTML = `
        <p>Chapter Name : ${newLecture.chapterName}</p>
        <p>Lecture Name: ${newLecture.title}</p>
        <p>Duration: ${newLecture.duration} minutes</p>
        <p>Description: ${newLecture.description}</p>
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

// adding courses 
async function addCourses() {
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
    // Check if the image filename contains spaces or parentheses
    const courseImage = courseImageInput.files[0];
    if (courseImage) {
        const filename = courseImage.name;
        if (/[\s()]/.test(filename)) {
            alert('The course image filename should not contain spaces or parentheses. Please rename your file and try again.');
            courseImageInput.value = ''; // Clear the file input
            return;
        }
     }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('level', level);
    formData.append('duration', duration);
    formData.append('courseImage', courseImageInput.files[0]);

    try {
        const response = await fetchWithAuth('/courses', {
            method: 'POST',
            body: formData
        });

        if (!response) return;

        if (response.ok) {
            const newCourse = await response.json();
            alert('Course saved successfully');
            makeFieldsUneditable();
            document.getElementById('course-arrangement').style.display = 'block';
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

// so when the user submits the course details they are not allowed to edit the fields anymore 
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


