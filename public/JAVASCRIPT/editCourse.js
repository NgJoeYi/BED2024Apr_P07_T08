document.addEventListener('DOMContentLoaded', async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseID = urlParams.get('courseID');
  if (courseID) {
    try {
      const response = await fetch(`/courses/${courseID}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const { course, userID: courseCreatorUserID } = await response.json();
      populateCourseDetails(course);
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  }

  const form = document.getElementById('edit-course-form');
  if (form){
    form.addEventListener('submit', async function(event) {
      event.preventDefault();

      const title = document.getElementById('courseTitle').value;
      const description = document.getElementById('courseDescription').value;
      const category = document.getElementById('courseCategory').value;
      const level = document.getElementById('courseLevel').value;
      const duration = document.getElementById('courseDuration').value;
      const courseImageInput = document.getElementById('courseImageInput');

      if (!title || !description || !category || !level || !duration) {
        alert('Please fill all the required fields.');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('level', level);
      formData.append('duration', duration);

      if (courseImageInput.files.length > 0) {
        formData.append('courseImage', courseImageInput.files[0]);
      }
      // Log form data before sending
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`/courses/${courseID}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        alert('Course updated successfully!');
        window.location.href = 'courses.html';
      } catch (error) {
        console.error('Error updating course:', error);
        alert('Error updating course.');
      }
    });
  }
});

function populateCourseDetails(course) {
  document.getElementById('courseTitle').value = course.title;
  document.getElementById('courseDescription').value = course.description;
  document.getElementById('courseLevel').value = course.level;
  document.getElementById('courseCategory').value = course.category;
  document.getElementById('courseDuration').value = course.duration;
  console.log('IMAGE:',course.courseID);
  const courseImageElement = document.getElementById('courseImage');
  if (courseImageElement && course.courseImage) {
    const imageUrl = `/courses/image/${course.courseID}`;
    courseImageElement.src = imageUrl;
    courseImageElement.alt = "Course Image";
  }
}