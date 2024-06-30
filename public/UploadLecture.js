// Function to open the modal
function triggerFileUpload() {
    document.getElementById('newFileModal').style.display = 'block';
}

// Function to close the modal
function closeModal() {
    document.getElementById('newFileModal').style.display = 'none';
}

async function fetchLastChapterName() {
    const lecturerID = sessionStorage.getItem('LecturerID'); 
    console.log("Fetching chapter for Lecturer ID:", lecturerID);
    if (!lecturerID) {
        console.error("Lecturer ID not found in sessionStorage.");
        return null; 
    }

    try {
        const response = await fetch(`/lectures/last-chapter/${lecturerID}`);
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
    const duration = document.getElementById('duration').value.trim();
    const description = document.getElementById('description').value.trim();
    const videoFileInput = document.getElementById('videoFiles');
    const imageFileInput = document.getElementById('lectureImage');

    console.log("Chapter Name Input:", chapterNameInput);
    console.log("Title:", title);
    console.log("Duration:", duration);
    console.log("Description:", description);

    const lecturerID = sessionStorage.getItem('LecturerID');
    console.log("LecturerID from Session:", lecturerID);

    if (!lecturerID) {
        alert('LecturerID not found. Please log in again.');
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

    const formData = new FormData();
    formData.append('LecturerID', lecturerID);
    formData.append('ChapterName', chapterName);
    formData.append('Title', title);
    formData.append('Duration', duration);
    formData.append('Description', description);
    Array.from(videoFileInput.files).forEach(file => formData.append('Video', file));
    Array.from(imageFileInput.files).forEach(file => formData.append('LectureImage', file));

    try {
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
