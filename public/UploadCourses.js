// Function to open the modal
function triggerFileUpload() {
    document.getElementById('newFileModal').style.display = 'block';
}

// Function to close the modal
function closeModal() {
    document.getElementById('newFileModal').style.display = 'none';
}

// Variables to track the previous chapter name
let previousChapterName = null;

// Function to add files to the course
async function addFiles() {
    const chapterName = document.getElementById('chapterName').value.trim();
    const title = document.getElementById('lectureName').value.trim();
    const duration = document.getElementById('duration').value.trim();
    const description = document.getElementById('description').value.trim();
    const videoFileInput = document.getElementById('videoFiles');
    const imageFileInput = document.getElementById('lectureImage');

    if (!title || !duration || !description || videoFileInput.files.length === 0 || imageFileInput.files.length === 0) {
        alert('Please fill in all fields and select at least one file.');
        return;
    }

    const formData = new FormData();

    if (chapterName || previousChapterName) {
        formData.append('ChapterName', chapterName || previousChapterName);
        previousChapterName = chapterName || previousChapterName; // Update previous chapter name
    }

    formData.append('Title', title);
    formData.append('Duration', duration);
    formData.append('Description', description);

    Array.from(videoFileInput.files).forEach(file => {
        console.log('Appending video file:', file.name);
        formData.append('Video', file);
    });

    Array.from(imageFileInput.files).forEach(file => {
        console.log('Appending image file:', file.name);
        formData.append('LectureImage', file);
    });

    console.log('Form Data:', Array.from(formData.entries()));

    try {
        const response = await fetch('/lectures', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const newLecture = await response.json();
            displayNewLecture(newLecture);
            closeModal();
        } else {
            throw new Error('Failed to save the lecture');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving the lecture.');
    }
}


// Function to display the new lecture in the UI
function displayNewLecture(newLecture) {
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

// Function to remove a chapter
function removeChapter(element) {
    element.closest('.chapter').remove();
}

// Function to remove a file item
function removeFile(element) {
    element.closest('.file-item').remove();
}
