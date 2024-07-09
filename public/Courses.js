// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    checkUserRoleAndFetchCourses();
    deleteCourseWithNoLectures();

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
        const response = await fetch('/courses'); // -- jwt, no token required, users that are not logged in can view the courses
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
// DELETING COURSES WITH NO LECTURES 
async function deleteCourseWithNoLectures() {
    try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('/courses/noLectures', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('came here')
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Deleted courses with no lectures'); // Log success
        fetchCourses(); // Refresh the courses list
    } catch (error) {
        console.error('Error deleting courses with no lectures:', error);
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
                        <button class="edit-course"  data-course-id="${course.courseID}" onclick="editCourse(event, this)">Edit</button>           
                    </div>
                    ` : ''}
                    <div class="reviews-count-container">
                        <span id="review-count-${course.courseID}" class="review-count">💬 0 Reviews</span>
                    </div>
                </div>
            </a>
        `;
        coursesGrid.appendChild(courseElement);

        // Fetch and display the review count for each course
        fetchReviewCountForCourse(course.courseID);
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
        const token = sessionStorage.getItem('token');
        const response = await fetch(`/courses/${courseID}`, {
            method: 'DELETE',
            headers: {  // -- jwt implementation
                'Authorization': `Bearer ${token}` // -- jwt implementation
            }  // -- jwt implementation
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

//  EDIT COURSE
async function editCourse(event, button) {
    event.stopPropagation();
    event.preventDefault();

    const courseID = button.dataset.courseId;
    const token = sessionStorage.getItem('token'); // Get the JWT token from sessionStorage
    if (!courseID) {
        alert('Course ID not found.');
        return;
    }
    try {
        const response = await fetch(`/courses/${courseID}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const { course, userID: courseCreatorUserID } = await response.json();
        
        // Decode the JWT to get the user ID of the logged-in user
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const loggedInUserID = decodedToken.id;
        console.log(courseCreatorUserID);
        if (courseCreatorUserID !== loggedInUserID) {
            alert('You do not have permission to edit this course.');
            return;
        }
        // Redirect to edit course page with courseID as query parameter
        window.location.href = `updateCourse.html?courseID=${courseID}`;
    } catch (error) {
        console.error('Error fetching course details:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseID = urlParams.get('courseID');
    if (courseID) {
        try {
            const response = await fetch(`/courses/${courseID}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const course = await response.json();
            populateCourseDetails(course);
        } catch (error) {
            console.error('Error fetching course details:', error);
        }
    }

    const form = document.getElementById('edit-course-form');
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
        formData.append('userID', userID);

        // Log form data before sending
        formData.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });

        try {
            const response = await fetch(`/courses/${courseID}`, {
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
});

function populateCourseDetails(course) {
    document.getElementById('courseTitle').value = course.title;
    document.getElementById('courseDescription').value = course.description;
    document.getElementById('courseLevel').value = course.level;
    document.getElementById('courseCategory').value = course.category;
    document.getElementById('courseDuration').value = course.duration;

    const courseImageElement = document.getElementById('courseImage');
    if (courseImageElement && course.courseImage) {
        const imageUrl = `/courses/image/${course.courseID}`;
        courseImageElement.src = imageUrl;
        courseImageElement.alt = "Course Image";
    }
}

function fetchReviewCountForCourse(courseId) {
    fetch(`/reviews/count?courseId=${courseId}`)
        .then(response => response.json())
        .then(data => {
            if (data.count !== undefined) {
                const reviewCountElement = document.getElementById(`review-count-${courseId}`);
                reviewCountElement.textContent = `💬 ${data.count} Reviews`;
            } else {
                console.error('Error fetching review count for course:', data);
                alert('Error fetching review count.');
            }
        })
        .catch(error => {
            console.error('Network or server error:', error);
            alert('Error fetching review count.');
        });
}