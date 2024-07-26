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
  if(form){
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
        // Check if the image filename contains spaces, parentheses, or hyphens
        const courseImage = courseImageInput.files[0];
        if (courseImage) {
          const filename = courseImage.name;
          if (/[\s()\-]/.test(filename)) {
            alert('The course image filename should not contain spaces, parentheses, or hyphens. Please rename your file and try again.');
            courseImageInput.value = ''; // Clear the file input
            return;
          }
        }
        formData.append('courseImage', courseImageInput.files[0]);
      } else {
        // Append a flag indicating that no new image was provided
        formData.append('noImageChange', 'true');
      }
    
      // Log form data before sending
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
    
      try {
        const response = await fetchWithAuth(`/courses/${courseID}`, {
          method: 'PUT',
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
  const courseImageElement = document.getElementById('courseImage');
  if (courseImageElement && course.courseImage) {
    const imageUrl = `/courses/image/${course.courseImage}`;
    courseImageElement.src = imageUrl;
    courseImageElement.alt = "Course Image";
  }
}