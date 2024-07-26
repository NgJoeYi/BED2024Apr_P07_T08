// allows user to choose either to upload files from vimeo or personal file 
function toggleUploadOptions() {
    const localFileOption = document.getElementById("localFileOption").checked;
    const fileInputContainer = document.getElementById("localFileInput");
    const vimeoVideosContainer = document.getElementById("vimeoVideosContainer");

    if (localFileOption) {
        fileInputContainer.style.display = "block";
        vimeoVideosContainer.style.display = "none";
    } else {
        fileInputContainer.style.display = "none";
        vimeoVideosContainer.style.display = "block";
    }
}
// Call this function once to initialize the state correctly
toggleUploadOptions();

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
    const localFileOption = document.getElementById("localFileOption").checked;
    const videoFileInput = document.getElementById('videoFiles');
    const chapterName = document.getElementById('chapterName').value.trim();

    // Check if all required fields are filled
    if (!title || !duration || !description || (localFileOption && videoFileInput.files.length === 0)) {
        alert('Please fill in all fields and select a video file.');
        return;
    }

    // Check if the video filename contains spaces
    if (localFileOption) {
        const videoFile = videoFileInput.files[0];
        if (videoFile && videoFile.name.includes(' ')) {
            alert('The video filename should not contain spaces. Please rename your file and try again.');
            videoFileInput.value = ''; // Clear the file input
            return;
        }
    }

    // Check if the duration is a positive number
    if (duration <= 0) {
        alert('The duration cannot be lesser than or equal to 0.');
        return;
    }

    // Create a FormData object to hold the form data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('duration', duration);
    formData.append('description', description);
    formData.append('chapterName', chapterName);

    // Add the video file or Vimeo URL to the FormData
    if (localFileOption) {
        formData.append('lectureVideo', videoFileInput.files[0]);
    } else {
        const selectedVideo = document.querySelector('.vimeo-video');
        console.log('SELECTED :', selectedVideo);
        if (!selectedVideo) {
            alert('Please select a Vimeo video.');
            return;
        }
        formData.append('vimeoVideoUrl', selectedVideo.getAttribute('data-video-url'));
    }

    // Log FormData entries for debugging purposes
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }

    try {
        // Fetch the max course ID
        const courseIDResponse = await fetchWithAuth('/lectures/max-course-id');
        if (!courseIDResponse.ok) {
            throw new Error('Failed to fetch max course ID');
        }
        const courseIDData = await courseIDResponse.json();
        const courseID = courseIDData.maxCourseID;
        formData.append('courseID', courseID);

        // Log FormData entries again to ensure courseID is included
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        // Send the form data to the server
        const response = await fetchWithAuth('/lectures', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Failed to upload lecture: ${errorData.message}`);
            return;
        }

        // Process the server response
        const newLecture = await response.json();
        alert('Lecture uploaded successfully');
        displayNewLecture(newLecture, videoFileInput.files);
        closeModal();
    } catch (error) {
        console.error('Error uploading lecture:', error);
        alert('Error uploading lecture.');
    }
}


// Search Vimeo videos
async function fetchVimeoVideos() {
    const searchQuery = document.getElementById('vimeoSearch').value;
    try {
        const response = await fetch(`/lectures/vimeo-videos?search=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) {
            alert('Something went wrong while fetching Vimeo videos.');
            throw new Error('Failed to fetch Vimeo videos');
        }
        const data = await response.json();
        alert(data.message);
        displayVimeoVideos(data);
    } catch (error) {
        console.error('Error fetching Vimeo videos:', error);
    }
}

// Display Vimeo videos
function displayVimeoVideos(data) {
    const container = document.getElementById('vimeoVideoResults');
    container.innerHTML = ''; // Clear previous results

    if (data.videos && data.videos.data.length > 0) {
        data.videos.data.forEach((video, index) => {
            const videoElement = document.createElement('div');
            videoElement.classList.add('vimeo-video');
            videoElement.setAttribute('id', `vimeo-video-${index}`);
            videoElement.setAttribute('data-video-url', video.link);

            const videoTitle = document.createElement('h4');
            videoTitle.textContent = video.name;

            const videoThumbnail = document.createElement('img');
            videoThumbnail.src = video.pictures.sizes[2].link; // Use appropriate size

            const selectButton = document.createElement('button');
            selectButton.textContent = 'Select';
            selectButton.onclick = () => selectVimeoVideo(videoElement, videoElement.id);

            videoElement.appendChild(videoTitle);
            videoElement.appendChild(videoThumbnail);
            videoElement.appendChild(selectButton);

            container.appendChild(videoElement);
        });
    } else {
        container.innerHTML = '<p>No videos found</p>';
    }
}


// Select Vimeo video
function selectVimeoVideo(video, selectedId) {
    // Hide all video containers
    const allVideoContainers = document.querySelectorAll('.vimeo-video');
    allVideoContainers.forEach(container => {
        if (container.getAttribute('id') !== selectedId) {
            container.style.display = 'none';
        }
    });

    // Show only the selected video container
    const selectedContainer = document.getElementById(selectedId);
    console.log(selectedContainer);
    selectedContainer.style.display = 'block';

    // Handle the selected video, e.g., set the video URL to a hidden input field
    console.log('Selected video:', video);
}

// Generates HTML code to display the lecture
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

    // Check if the video is a local file or a Vimeo URL
    const videoFileNames = Array.from(videoFiles).map(file => file.name).join(', ');
    const videoElement = document.createElement('p');

    // Display either Vimeo URL or file names
    if (document.getElementById("localFileOption").checked) {
        videoElement.textContent = `Lecture Video: ${videoFileNames}`;
    } else {
        const selectedVideo = document.querySelector('.vimeo-video');
        if (selectedVideo) {
            videoElement.textContent = `Lecture Video: ${selectedVideo.getAttribute('data-video-url')}`;
        } else {
            videoElement.textContent = 'Lecture Video: No Vimeo video selected';
        }
    }

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
    document.getElementById('vimeoVideoResults').style.display = 'none';
    document.getElementById('vimeoSearch').value='';
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
    // Check if the image filename contains spaces or parentheses or hyphens
    const courseImage = courseImageInput.files[0];
    if (courseImage) {
        const filename = courseImage.name;
        if (/[\s()-]/.test(filename)) {
            alert('The course image filename should not contain spaces or parentheses. Please rename your file and try again.');
            courseImageInput.value = ''; // Clear the file input
            return;
        }
    }
    if(duration<=0){
        alert('The duration cannot be lesser than or equal to 0.');
        duration.value='';
        return;
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


