// Function to open the modal
function triggerFileUpload() {
    document.getElementById('newFileModal').style.display = 'block';
}

// Function to close the modal
function closeModal() {
    document.getElementById('newFileModal').style.display = 'none';
}

async function fetchLastChapterName() {
    const lecturerID = sessionStorage.getItem('LecturerID'); // Retrieve LecturerID from sessionStorage
    if (!lecturerID) {
        console.error("Lecturer ID not found in sessionStorage.");
        return null; // Exit the function if no lecturer ID is found
    }

    try {
        console.log('lecturerID', lecturerID);
        const response = await fetch(`/lectures/last-chapter/${lecturerID}`);
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


async function addFiles() {
    let previousChapterName = await fetchLastChapterName();
    const chapterName = document.getElementById('chapterName').value.trim();
    const title = document.getElementById('lectureName').value.trim();
    const duration = document.getElementById('duration').value.trim();
    const description = document.getElementById('description').value.trim();
    const videoFileInput = document.getElementById('videoFiles');
    const imageFileInput = document.getElementById('lectureImage');

    const lecturerID = sessionStorage.getItem('LecturerID');

    if (!lecturerID) {
        alert('LecturerID not found. Please log in again.');
        return;
    }

    if (!title || !duration || !description || videoFileInput.files.length === 0 || imageFileInput.files.length === 0) {
        alert('Please fill in all fields and select at least one file.');
        return;
    }

    const formData = new FormData();
    formData.append('LecturerID', lecturerID);

    if (chapterName) {
        formData.append('ChapterName', chapterName);
        previousChapterName = chapterName;
    } else if (previousChapterName) {
        formData.append('ChapterName', previousChapterName);
    } else {
        alert('Please enter a chapter name.');
        return;
    }

    formData.append('Title', title);
    formData.append('Duration', duration);
    formData.append('Description', description);

    Array.from(videoFileInput.files).forEach(file => {
        formData.append('Video', file);
    });

    Array.from(imageFileInput.files).forEach(file => {
        formData.append('LectureImage', file);
    });

    try {
        const response = await fetch('/lectures', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const newLecture = await response.json();
            displayNewLecture(newLecture, videoFileInput.files, imageFileInput.files);
            closeModal();
        } else {
            throw new Error('Failed to save the lecture');
        }
    } catch (error) {
        console.error('Error:', error);
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

    // Display the image
    const imageFile = imageFiles[0];
    const imageURL = URL.createObjectURL(imageFile);
    const imageElement = document.createElement('img');
    imageElement.src = imageURL;
    imageElement.alt = 'Lecture Image';
    imageElement.width = 200; // Set width
    imageElement.height = 200; // Set height
    lectureDetails.appendChild(imageElement);

    // Display the video file names
    const videoFileNames = Array.from(videoFiles).map(file => file.name).join(', ');
    const videoElement = document.createElement('p');
    videoElement.textContent = `Lecture Video: ${videoFileNames}`;
    lectureDetails.appendChild(videoElement);

    newChapterDiv.appendChild(chapterNameElement);
    newChapterDiv.appendChild(lectureDetails);

    const filesContainer = document.createElement('div');
    filesContainer.className = 'files';

    (newLecture.files || []).forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <p>
                ⇒ 
                <i class="fa-solid fa-file" style="color: #000000;"></i>
                ${file}
                <span class="delete-icon" onclick="removeFile(this)">
                    <i class="fa-solid fa-x" style="color: #ff3838;"></i>
                </span>
            </p>
        `;
        filesContainer.appendChild(fileItem);
    });

    newChapterDiv.appendChild(filesContainer);
    courseArrangement.insertBefore(newChapterDiv, courseArrangement.querySelector('.new-btn-container'));

    // Clear the modal inputs
    document.getElementById('chapterName').value = '';
    document.getElementById('lectureName').value = '';
    document.getElementById('duration').value = '';
    document.getElementById('description').value = '';
    document.getElementById('fileInputContainer').innerHTML = `
        <label for="videoFiles">Upload Video Files:</label>
        <input type="file" id="videoFiles" name="videoFiles" accept="video/*" multiple required>
    `;
}

function removeChapter(element) {
    element.closest('.chapter').remove();
}

function removeFile(element) {
    element.closest('.file-item').remove();
}

async function addCourse() {
    const title = document.getElementById('course-name').value.trim();
    const description = document.getElementById('course-details').value.trim();
    const videoFileInput = document.getElementById('videoFiles');
    const imageFileInput = document.getElementById('lectureImage');
}
