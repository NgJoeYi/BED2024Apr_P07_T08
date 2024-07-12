document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const lectureID = urlParams.get('lectureID');
    const courseID = urlParams.get('courseID');

    if (lectureID && courseID) {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                alert('User not authenticated. Please log in.');
                return;
            }
            const response = await fetch(`/lectures/${lectureID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const lecture = await response.json();
            populateLectureDetails(lecture);
        } catch (error) {
            console.error('Error fetching lecture details:', error);
        }
    }

    const form = document.getElementById('edit-lecture-form');
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
    
            const formData = new FormData(form);
            const lectureVideoInput = document.getElementById('lectureVideoInput');
            const presentVideoElement = document.getElementById('lectureVideo');
    
            console.log('FormData before appending:', Array.from(formData.entries()));
    
            if (lectureVideoInput.files.length > 0) {
                console.log('New lecture video selected:', lectureVideoInput.files[0]);
                 // Remove existing 'lectureVideo' field if present
                formData.delete('lectureVideo');
                formData.append('lectureVideo', lectureVideoInput.files[0]);
            } else if (presentVideoElement.src) {
                console.log('Using existing lecture video:', presentVideoElement.src);
            }
    
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    alert('User not authenticated. Please log in.');
                    return;
                }
    
                console.log('Final FormData:', Array.from(formData.entries())); // Log final FormData before sending
    
                const response = await fetch(`/lectures/${lectureID}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
    
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response text:', errorText);
                    throw new Error('Network response was not ok');
                }
    
                const responseData = await response.json();
                console.log('Updated Lecture Data:', responseData.data);
                alert('Lecture updated successfully!');
                window.location.href = `lecture.html?courseID=${courseID}`;
            } catch (error) {
                console.error('Error updating lecture:', error);
                alert('Error updating lecture.');
            }
        });
    }
    
});

function populateLectureDetails(lecture) {
    console.log('Populating lecture details:', lecture);

    document.getElementById('lectureTitle').value = lecture.title || '';
    document.getElementById('lectureDescription').value = lecture.description || '';
    document.getElementById('lectureChapterName').value = lecture.chapterName || '';
    document.getElementById('lectureDuration').value = lecture.duration || '';

    const lectureVideoElement = document.getElementById('lectureVideo');
    const lectureVideoInputElement = document.getElementById('lectureVideoInput');

    if (lectureVideoElement && lecture.video) {
        const videoUrl = `/video/${lecture.lectureID}`;
        lectureVideoElement.src = videoUrl;
        lectureVideoElement.controls = true;
        lectureVideoElement.style.display = 'block';
        lectureVideoInputElement.value = '';
    } else {
        lectureVideoElement.style.display = 'none';
    }
}
