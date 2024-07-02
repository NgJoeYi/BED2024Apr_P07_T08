document.addEventListener('DOMContentLoaded', function() {
    checkUserRoleAndFetchCourses();

    // Add click event listeners to course elements
    const courseElements = document.querySelectorAll('.course-cd-unique a');
    courseElements.forEach(courseElement => {
        courseElement.addEventListener('click', function(event) {
            const courseID = this.closest('.course-cd-unique').dataset.courseId;
            // Pass the course ID in the URL as a query parameter
            this.href = `lecture.html?courseID=${courseID}`;
        });
    });
});

// GETTING ALL COURSES
async function fetchCourses() {
    try {
        const response = await fetch('/courses');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const courses = await response.json();
        console.log('Fetched courses:', courses); // Log the fetched courses
        displayCourses(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
    }
}

function displayCourses(courses) {
    const coursesGrid = document.querySelector('.courses-grid-unique');
    coursesGrid.innerHTML = ''; // Clear any existing content
    const userRole = sessionStorage.getItem('role');

    courses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.className = 'course-cd-unique';
        courseElement.dataset.category = course.category;
        courseElement.dataset.date = course.createdAt;
        courseElement.dataset.courseId = course.courseID; // Add courseID to data attribute

        // Fetch the image from the new endpoint
        const imageUrl = `/courses/image/${course.courseID}`;

        courseElement.innerHTML = `
            <a href="lecture.html?courseID=${course.courseID}">
                <img src="${imageUrl}" alt="Course Image">
                <div class="course-details-unique">
                    <p class="category">${course.category}</p>
                    <h6>${course.title}</h6>
                    <div class="course-meta">
                        <span>${course.duration} hr</span>
                    </div>
                    <div>
                        <p class="posted-date">Posted on: ${new Date(course.createdAt).toLocaleDateString()}</p>
                        <p>${course.level}</p>
                    </div>
                    ${userRole === 'lecturer' ? `
                    <div class="delete-button-container">
                        <button class="delete-course" data-course-id="${course.courseID}" onclick="deleteCourse(event, this)">Delete</button>
                    </div>` : ''}
                </div>
            </a>
        `;
        console.log('COURSE ID IN HTML: ', course.courseID);
        coursesGrid.appendChild(courseElement);
    });
}

function checkUserRoleAndFetchCourses() {
    const userRole = sessionStorage.getItem('role');
    console.log(userRole);
    if (userRole === 'lecturer') {
        document.querySelector('.add-button').style.display = 'block';
    } else {
        document.querySelector('.add-button').style.display = 'none';
    }

    fetchCourses(); // Fetch courses after checking user role
}


// DELETE COURSE
async function deleteCourse(event, button) {
    event.stopPropagation();
    event.preventDefault();

    const courseID = button.dataset.courseId;
    if (!courseID) {
        alert('Course ID not found.');
        return;
    }
    console.log('DELETE COURSE ID :',courseID);

    if (!confirm('Are you sure you want to delete this course?')) {
        return;
    }

    try {
        const response = await fetch(`/courses/${courseID}`, {
            method: 'DELETE'
        });
        console.log('PASSED HERE ');
        if (response.ok) {
            if (response.status === 204) {
                alert('Course deleted successfully!');
                button.closest('.course-cd-unique').remove(); // Remove the course element from the DOM
            } else {
                const result = await response.json();
                alert(result.message);
                button.closest('.course-cd-unique').remove(); // Remove the course element from the DOM
            }
        } else {
            const errorData = await response.json();
            console.error('Failed to delete course. Status:', response.status, 'Message:', errorData.message);
            alert('Failed to delete the course. ' + errorData.message);
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        alert('Error deleting course.');
    }
}