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
