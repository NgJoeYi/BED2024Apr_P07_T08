// Function to open the modal
function triggerFileUpload() {
    document.getElementById('newFileModal').style.display = 'block';
}

// Function to close the modal
function closeModal() {
    document.getElementById('newFileModal').style.display = 'none';
}

// MAYBE DONT NEED
// Function to add more file input fields
function addMoreFileInput() {
    const fileInputContainer = document.getElementById('fileInputContainer');
    const newFileInput = document.createElement('input');
    newFileInput.type = 'file';
    newFileInput.name = 'videoFiles';
    newFileInput.accept = 'video/*';
    newFileInput.multiple = true;
    fileInputContainer.appendChild(newFileInput);
}

// Function to add files to the course
function addFiles() {
    const chapterName = document.getElementById('chapterName').value.trim();
    const fileInputs = document.querySelectorAll('#fileInputContainer input[type="file"]');

    if (fileInputs.length > 0) {
        const courseArrangement = document.getElementById('course-arrangement');

        let newChapter;
        // If the chapter name is provided, create a new chapter div
        if (chapterName) {
            newChapter = document.createElement('div');
            newChapter.className = 'chapter';
            newChapter.contentEditable = 'false';

            const chapterNameElement = document.createElement('div');
            chapterNameElement.className = 'chapter-name';
            chapterNameElement.innerHTML = `
                <p contenteditable="true" class="editable-placeholder">Chapter Name : ${chapterName}</p>
                <span class="delete-chapter-icon" onclick="removeChapter(this)">
                  <i class="fa-solid fa-x" style="color: #ff3838;"></i>
                </span>
            `;

            newChapter.appendChild(chapterNameElement);
        } else {
            // If no chapter name is provided, append to the last chapter
            const chapters = document.querySelectorAll('.course-arrangement .chapter');
            newChapter = chapters[chapters.length - 1];
        }

        // Create files container div
        const filesContainer = newChapter.querySelector('.files') || document.createElement('div');
        filesContainer.className = 'files';

        // Append each selected file to the files container
        fileInputs.forEach(input => {
            Array.from(input.files).forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <p>
                      ⇒ 
                      <i class="fa-solid fa-file" style="color: #000000;"></i>
                      ${file.name}
                      <span class="delete-icon" onclick="removeFile(this)">
                        <i class="fa-solid fa-x" style="color: #ff3838;"></i>
                      </span>
                    </p>
                `;
                filesContainer.appendChild(fileItem);
            });
        });

        // Append filesContainer to newChapter if not already appended
        if (!newChapter.querySelector('.files')) {
            newChapter.appendChild(filesContainer);
        }

        // Append newChapter to courseArrangement if it's a new chapter
        if (chapterName) {
            courseArrangement.insertBefore(newChapter, courseArrangement.querySelector('.new-btn-container'));
        }

        // Clear the modal inputs
        document.getElementById('chapterName').value = '';
        document.getElementById('lectureName').value = '';
        document.getElementById('duration').value = '';
        document.getElementById('description').value = '';
        document.getElementById('fileInputContainer').innerHTML = `
            <label for="videoFiles">Upload Video Files:</label>
            <input type="file" id="videoFiles" name="videoFiles" accept="video/*" multiple required>
        `;

        // Close the modal
        closeModal();
    } else {
        alert('Please select at least one file.');
    }
}

// Function to remove a chapter
function removeChapter(element) {
    element.closest('.chapter').remove();
}

// Function to remove a file item
function removeFile(element) {
    element.closest('.file-item').remove();
}

// Function to upload image
function uploadImage() {
    const fileInputContainer = document.getElementById('fileInputContainer');
    const newFileInput = document.getElementById('imageFile');

    newFileInput.addEventListener('change', () => {
        // Remove any existing image
        const existingImage = fileInputContainer.querySelector('img');
        if (existingImage) {
            fileInputContainer.removeChild(existingImage);
        }

        const file = newFileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                img.style.maxWidth = '100%';
                fileInputContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Initialize upload image function
document.addEventListener('DOMContentLoaded', () => {
    uploadImage();
});

// Function to submit the course
async function submitCourse() {
    const courseName = document.getElementById('course-name').textContent.trim();
    const courseDetails = document.getElementById('course-details').textContent.trim();
    const skillsCovered = document.getElementById('course-skills-covered').textContent.trim();
    const imageFile = document.getElementById('imageFile').files[0];

    if (!courseName || !courseDetails || !skillsCovered || !imageFile) {
        alert('Please fill in all course details and select an image.');
        return;
    }

    const formData = new FormData();
    formData.append('title', courseName);
    formData.append('description', courseDetails);
    formData.append('skillsCovered', skillsCovered);
    formData.append('courseImage', imageFile);

    try {
        const response = await fetch('/courses', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Course saved successfully!');
        } else {
            throw new Error('Failed to save the course');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving the course.');
    }
}

// Ensure the event listener is attached immediately
document.getElementById('submitCourseButton').addEventListener('click', submitCourse);

// Add event listeners to initialize placeholders
document.addEventListener('DOMContentLoaded', () => {
    const editableElements = document.querySelectorAll('[contenteditable]');
    editableElements.forEach(element => {
        element.setAttribute('data-placeholder', element.textContent);
        element.addEventListener('focus', () => {
            if (element.textContent === element.getAttribute('data-placeholder')) {
                element.textContent = '';
            }
        });
        element.addEventListener('blur', () => {
            if (element.textContent.trim() === '') {
                element.textContent = element.getAttribute('data-placeholder');
            }
        });
    });
});
