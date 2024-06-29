document.addEventListener('DOMContentLoaded', function() {
    fetchCourses();
    checkUserRoleAndFetchCourses();
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

        // Fetch the image from the new endpoint
        const imageUrl = `/courses/image/${course.courseID}`;

        courseElement.innerHTML = `
            <a href="lecture.html">
                <img src="${imageUrl}" alt="Course Image">
                <div class="course-details-unique">
                    <p class="category">${course.category}</p>
                    <h6>${course.title}</h6>
                    <div class="course-meta">
                        <span>${course.duration} hr</span>
                    </div>
                    <div>
                        <p class="posted-date">Posted on: ${new Date(course.createdAt).toLocaleDateString()}</p>
                        <p>${course.level} </p>
                    </div>
                </div>
            </a>
        `;
        console.log(course.level);

        coursesGrid.appendChild(courseElement);
    });
}

async function checkUserRoleAndFetchCourses() {
    try {
        const userResponse = await fetch('/current-user');
        if (!userResponse.ok) {
            throw new Error('Network response was not ok');
        }
        const user = await userResponse.json();
        console.log('Fetched user:', user); // Log the fetched user

        // Conditionally display the add button
        if (user.role === 'lecturer') {
            document.querySelector('.add-button').style.display = 'block';
        } else {
            document.querySelector('.add-button').style.display = 'none';
        }

        fetchCourses(); // Fetch courses after checking user role
    } catch (error) {
        console.error('Error fetching user or courses:', error);
        throw(error);
    }
}

