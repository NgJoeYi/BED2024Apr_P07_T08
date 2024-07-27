document.addEventListener('DOMContentLoaded', async function() {
    // Initialize the state correctly
    toggleUploadOptions();

    // Extract lectureID and courseID from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const lectureID = urlParams.get('lectureID');
    const courseID = urlParams.get('courseID');

    // If both lectureID and courseID are present, fetch the lecture details
    if (lectureID && courseID) {
        try {
            // Fetch lecture details using authenticated request
            const response = await fetchWithAuth(`/lectures/${lectureID}`); // headers in jwtutility.js
            if (!response.ok) throw new Error('Network response was not ok');
            const lecture = await response.json();
            // Populate the form with the fetched lecture details
            populateLectureDetails(lecture);
        } catch (error) {
            console.error('Error fetching lecture details:', error);
            alert('Error fetching lecture details. Please try again later.');
        }
    }

    // Find the form element for editing the lecture
    const form = document.getElementById('edit-lecture-form');
    if (form) {
        // Add event listener for form submission
        form.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent default form submission behavior

            // Create FormData object from the form
            const formData = new FormData(form);
            const localFileOption = document.getElementById("localFileOption").checked;
            const videoFileInput = document.getElementById('videoFiles');

            // Remove any existing 'lectureVideo' field from formData to avoid duplication
            formData.delete('lectureVideo');

            // Handle local file uploads
            if (localFileOption) {
                const videoFile = videoFileInput.files[0];
                if (videoFile) {
                    if (videoFile.name.includes(' ')) {
                        alert('The video filename should not contain spaces. Please rename your file and try again.');
                        videoFileInput.value = ''; // Clear the file input
                        return;
                    }
                    formData.append('lectureVideo', videoFile);
                } else {
                    alert('Please select a local file.');
                    return;
                }
            } else {
                // If Vimeo URL is chosen, make sure it is appended correctly
                const selectedVideo = document.querySelector('.vimeo-video.selected');
                if (selectedVideo) {
                    formData.append('vimeoVideoUrl', selectedVideo.getAttribute('data-video-url'));
                } else {
                    return;
                }
            }

            console.log('FINAL FORM DATA', Array.from(formData.entries()));

            try {
                // Send the updated lecture data to the server using authenticated request
                const response = await fetchWithAuth(`/lectures/${lectureID}`, { // headers in jwtutility.js
                    method: 'PUT',
                    body: formData
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response text:', errorText);
                    throw new Error('Network response was not ok');
                }

                const responseData = await response.json();
                console.log('Updated Lecture Data:', responseData.data);
                // Alert user and redirect to lecture page upon successful update
                alert('Lecture updated successfully!');
                window.location.href = `lecture.html?courseID=${courseID}`;
            } catch (error) {
                console.error('Error updating lecture:', error);
                alert('Error updating lecture. Please try again later.');
            }
        });
    }
});

// Populate form fields with lecture details
function populateLectureDetails(lecture) {
    document.getElementById('lectureTitle').value = lecture.title || '';
    document.getElementById('lectureDescription').value = lecture.description || '';
    document.getElementById('lectureChapterName').value = lecture.chapterName || '';
    document.getElementById('lectureDuration').value = lecture.duration || '';
}

// Toggle between local file input and Vimeo video selection
function toggleUploadOptions() {
    const localFileInputContainer = document.getElementById('localFileInput');
    const vimeoVideosContainer = document.getElementById('vimeoVideosContainer');
    const localFileOption = document.getElementById('localFileOption').checked;

    if (localFileOption) {
        localFileInputContainer.style.display = 'block';
        vimeoVideosContainer.style.display = 'none';
    } else {
        localFileInputContainer.style.display = 'none';
        vimeoVideosContainer.style.display = 'block';
    }
}

// Search Vimeo videos
async function fetchVimeoVideos() {
    const searchQuery = document.getElementById('vimeoSearch').value;
    console.log('Searching for Vimeo videos with query:', searchQuery); // Log the search query
    try {
        const response = await fetch(`/lectures/search/vimeo-videos?search=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) {
            const errorData = await response.json(); // Extract error message
            alert(`Error: ${errorData.error || 'Failed to fetch Vimeo videos'}`);
            throw new Error('Failed to fetch Vimeo videos');
        }
        const data = await response.json();
        console.log('Vimeo search result:', data); // Log the API response
        if (data.videos && data.videos.data.length > 0) {
            alert(data.message);
            displayVimeoVideos(data);
        } else {
            alert('No videos found for the search query.');
            displayVimeoVideos({ videos: { data: [] } }); // Clear previous results
        }
    } catch (error) {
        console.error('Error fetching Vimeo videos:', error);
        alert('Error fetching Vimeo videos.');
    }
}

// Display Vimeo videos
function displayVimeoVideos(data) {
    const container = document.getElementById('vimeoVideoResults');

    container.innerHTML = ''; // Clear previous results

    if (data.videos && data.videos.data.length > 0) {
        container.style.display = 'flex'; // Ensure it's visible
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
            selectButton.type = 'button'; // Change type to 'button' to prevent form submission
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
    selectedContainer.style.display = 'flex';

    // Mark the selected video
    selectedContainer.classList.add('selected');

    // Handle the selected video, e.g., set the video URL to a hidden input field
    console.log('Selected video:', video);
}
