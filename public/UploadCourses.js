function enableEditing(id) {
    const element = document.getElementById(id);
    if (element) {
        element.setAttribute('contenteditable', 'true');
        element.focus();
        element.addEventListener('blur', () => {
            element.setAttribute('contenteditable', 'false');
            if (element.textContent.trim() === '') {
                element.textContent = element.getAttribute('data-placeholder');
            }
        });
    } else {
        console.error('Element not found with ID:', id);
    }
}

// Function to open the modal
function triggerFileUpload() {
    document.getElementById('newFileModal').style.display = 'block';
}

// Function to close the modal
function closeModal() {
    document.getElementById('newFileModal').style.display = 'none';
}

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

// Function to add files
function addFiles() {
    const chapterName = document.getElementById('chapterName').value;
    const fileInputs = document.querySelectorAll('#fileInputContainer input[type="file"]');

    if (chapterName && fileInputs.length > 0) {
        const courseArrangement = document.getElementById('course-arrangement');

        // Create a new chapter div
        const newChapter = document.createElement('div');
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

        const editIcon = document.createElement('span');
        editIcon.className = 'edit-icon';
        editIcon.innerHTML = '<i class="fa-solid fa-pencil" style="color: #030303;"></i>';

        newChapter.appendChild(chapterNameElement);
        newChapter.appendChild(editIcon);

        // Create files container div
        const filesContainer = document.createElement('div');
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

        newChapter.appendChild(filesContainer);
        courseArrangement.insertBefore(newChapter, courseArrangement.querySelector('.new-btn-container'));

        // Clear the modal inputs
        document.getElementById('chapterName').value = '';
        document.getElementById('fileInputContainer').innerHTML = `
            <label for="videoFiles">Upload Video Files:</label>
            <input type="file" id="videoFiles" name="videoFiles" accept="video/*" multiple required>
        `;

        // Close the modal
        closeModal();
    } else {
        alert('Please provide a chapter name and select at least one file.');
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

// Function to submit the course
async function submitCourse() {
    const courseName = document.getElementById('course-name').textContent.trim();
    const courseDetails = document.getElementById('course-details').textContent.trim();
    const skillsCovered = document.getElementById('course-skills-covered').textContent.trim();

    if (!courseName || !courseDetails || !skillsCovered) {
        alert('Please fill in all course details.');
        return;
    }

    const chapters = [];
    document.querySelectorAll('.chapter').forEach(chapter => {
        const chapterName = chapter.querySelector('.chapter-name p').textContent.trim();
        const files = [];
        chapter.querySelectorAll('.file-item').forEach(fileItem => {
            files.push(fileItem.querySelector('p').textContent.trim());
        });
        chapters.push({ chapterName, files });
    });

    const courseData = {
        title: courseName,
        description: courseDetails,
        category: 'YourCategory', // Replace with actual category
        level: 'YourLevel', // Replace with actual level
        duration: 'YourDuration', // Replace with actual duration
        skillsCovered,
        chapters
    };

    try {
        const response = await fetch('/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseData)
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
