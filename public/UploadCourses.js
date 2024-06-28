// Function to open the modal
function triggerFileUpload() {
    document.getElementById('newFileModal').style.display = 'block';
}

// Function to close the modal
function closeModal() {
    document.getElementById('newFileModal').style.display = 'none';
}

// Function to add files to the course
async function addFiles() {
    const chapterName = document.getElementById('chapterName').value.trim();
    const title = document.getElementById('lectureName').value.trim(); // Match key name to backend
    const duration = document.getElementById('duration').value.trim();
    const description = document.getElementById('description').value.trim();
    const fileInputs = document.querySelectorAll('#fileInputContainer input[type="file"]');

    if (chapterName && title && duration && description && fileInputs.length > 0) {
        const formData = new FormData();
        formData.append('ChapterName', chapterName);
        formData.append('Title', title); // Ensure this key matches the backend
        formData.append('Duration', duration);
        formData.append('Description', description);

        fileInputs.forEach(input => {
            Array.from(input.files).forEach(file => {
                formData.append(file.name, file);
            });
        });

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
    } else {
        alert('Please fill in all fields and select at least one file.');
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
