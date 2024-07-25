document.addEventListener('DOMContentLoaded', async function() {
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
            const lectureVideoInput = document.getElementById('lectureVideoInput');
            const presentVideoElement = document.getElementById('lectureVideo');

            console.log('FormData before appending:', Array.from(formData.entries()));

            // Handle new lecture video file if selected
            if (lectureVideoInput.files.length > 0) {
                // Check if the video filename contains spaces
                const videoFile = lectureVideoInput.files[0];
                if (videoFile) {
                    if (videoFile.name.includes(' ')) {
                        alert('The video filename should not contain spaces. Please rename your file and try again.');
                        lectureVideoInput.value = ''; // Clear the file input
                        return;
                    }
                    console.log('New lecture video selected:', videoFile);
                    // Remove existing 'lectureVideo' field if present
                    formData.delete('lectureVideo');
                    formData.append('lectureVideo', videoFile);
                } else {
                    alert('No video file selected. Please choose a video file.');
                    return;
                }
            } else if (presentVideoElement.src) {
                console.log('Using existing lecture video:', presentVideoElement.src);
            }

            try {
                // Log final FormData before sending
                for (const [key, value] of formData.entries()) {
                    console.log(`${key}:`, value);
                }


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

// Function to populate the form fields and video player with lecture details
function populateLectureDetails(lecture) {
    console.log('Populating lecture details:', lecture);

    // Set the form field values based on the lecture data
    document.getElementById('lectureTitle').value = lecture.title || '';
    document.getElementById('lectureDescription').value = lecture.description || '';
    document.getElementById('lectureChapterName').value = lecture.chapterName || '';
    document.getElementById('lectureDuration').value = lecture.duration || '';

    // Handle video element display
    const lectureVideoElement = document.getElementById('lectureVideo');
    const videoSourceElement = document.getElementById('videoSource');
    const lectureVideoInputElement = document.getElementById('lectureVideoInput');
    
    if (lectureVideoElement && lecture.video) {
        const videoUrl = `/video/${lecture.video}`; // Make sure this URL is correct
        console.log('Setting video URL to:', videoUrl);
        videoSourceElement.src = videoUrl; // Set src on source element
        lectureVideoElement.load(); // Load new video source
        lectureVideoElement.controls = true; // Show video controls
        lectureVideoElement.style.display = 'block'; // Make video visible
        lectureVideoInputElement.value = ''; // Clear the video input field
    } else {
        lectureVideoElement.style.display = 'none'; // Hide video element if no video
    }
    
}
