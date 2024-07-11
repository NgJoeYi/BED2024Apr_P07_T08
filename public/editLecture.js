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
            console.log('Fetched lecture:', lecture);
            populateLectureDetails(lecture);
        } catch (error) {
            console.error('Error fetching lecture details:', error);
        }
    }

    const form = document.getElementById('edit-lecture-form');
    if (form) {
        console.log('form found');
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const formData = new FormData(form);
            const lectureVideoInput = document.getElementById('lectureVideoInput');
            const presentVideoElement = document.getElementById('lectureVideo');

            if (lectureVideoInput.files.length > 0) {
                formData.append('lectureVideo', lectureVideoInput.files[0]);
            } else if (presentVideoElement.src) {
                const response = await fetch(presentVideoElement.src);
                const blob = await response.blob();
                const file = new File([blob], 'existingVideo.mp4', { type: 'video/mp4' });
                formData.append('lectureVideo', file);
            } else {
                console.log('No new video provided and no existing video found.');
            }

            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    alert('User not authenticated. Please log in.');
                    return;
                }
                console.log('FORM DATA', Array.from(formData.entries()));
                const response = await fetch(`/lectures/${lectureID}`, {
                    method: 'PUT',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response text:', errorText);
                    throw new Error('Network response was not ok');
                }
                const responseData = await response.json();
                console.log('Updated Lecture Data:', responseData.data); // Log the updated lecture data
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
        const videoUrl = `/video/${lecture.LectureID}`;
        lectureVideoElement.src = videoUrl;
        lectureVideoElement.controls = true;
        lectureVideoElement.style.display = 'block';
        lectureVideoInputElement.value = '';
    } else {
        lectureVideoElement.style.display = 'none';
    }
}
