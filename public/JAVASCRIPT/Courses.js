// GETTING ALL COURSES
async function fetchCourses(category = 'all', sortBy = 'most-recent') {
  try {
    const token = sessionStorage.getItem('token');
    const userRole = sessionStorage.getItem('role');
    let response;

    if (category === 'all' && sortBy === 'most-recent') {
      response = await fetch('/courses/mostRecent');
    } else if (category === 'all' && sortBy === 'oldest') {
      response = await fetch('/courses/earliest');
    } else if (sortBy === 'most-recent') {
      response = await fetch(`/courses/filter?category=${category}&sort=most-recent`);
    } else {
      response = await fetch(`/courses/filter?category=${category}&sort=oldest`);
    }

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const courses = await response.json();
    coursesData = courses;
    console.log('Fetched courses:', courses);
    totalPages = Math.ceil(coursesData.length / itemsPerPage);
    displayCourses();

    if (userRole && token === 'lecturer') {
      deleteCourseWithNoLectures();
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
}


// DISPLAYING COURSES   
function displayCourses(filteredCourses = null) {
  const coursesGrid = document.querySelector('.courses-grid-unique');
  coursesGrid.innerHTML = ''; // Clear any existing content
  const userRole = sessionStorage.getItem('role');
  const token = sessionStorage.getItem('token');

  // Determine which courses to display
  const coursesToDisplay = filteredCourses || coursesData;

  coursesToDisplay.forEach(course => {
    const courseElement = document.createElement('div');
    courseElement.className = 'course-cd-unique';
    courseElement.dataset.category = course.Category;
    courseElement.dataset.date = course.CreatedAt;
    courseElement.dataset.courseId = course.CourseID; // Add courseID to data attribute

    // Fetch the image from the new endpoint
    const imageUrl = `/courses/image/${course.CourseID}`;

    courseElement.innerHTML = `
      <a href="lecture.html?courseID=${course.CourseID}">
          <img src="${imageUrl}" alt="Course Image">
          <div class="course-details-unique">
              <p class="category">${course.Category}</p>
              <h6>${course.Title}</h6>
              <div class="course-meta">
                  <span>${course.Duration} hr</span>
              </div>
              <div>
                  <p class="posted-date">Posted on: ${new Date(course.CreatedAt).toLocaleDateString()}</p>
                  <p>${course.Level}</p>
              </div>
              ${token && userRole === 'lecturer' ? `
              <div class="delete-button-container">
                  <button class="delete-course" data-course-id="${course.CourseID}" onclick="deleteCourse(event, this)">Delete</button>
                  <button class="edit-course" data-course-id="${course.CourseID}" onclick="editCourse(event, this)">Edit</button>           
              </div>
              ` : ''}
              <div class="reviews-count-container">
                  <span id="review-count-${course.CourseID}" class="review-count">💬 0 Reviews</span>
              </div>
          </div>
      </a>
    `;
    coursesGrid.appendChild(courseElement);

    // Fetch and display the review count for each course
    fetchReviewCountForCourse(course.CourseID);
  });
  updatePaginationControls();
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function () {
  handleAddButtonVisibility();
  fetchCourses();
  filter();

  // To GET INTO SPECIFIC COURSE PAGE
  const courseElements = document.querySelectorAll('.course-cd-unique a');
  courseElements.forEach(courseElement => {
    courseElement.addEventListener('click', function (event) {
      const courseID = this.closest('.course-cd-unique').dataset.courseId;
      this.href = `lecture.html?courseID=${courseID}`;
    });
  });

  // adding event listener for pagination
  document.getElementById('prev-page').addEventListener('click', prevPage);
  document.getElementById('next-page').addEventListener('click', nextPage);

  // add event listener for filtering category
  document.getElementById('filter-category').addEventListener('change', function () {
    currentPage = 1 // reset to first page
    const selectedCategory = this.value;
    fetchCourses(selectedCategory);
  });

  // add event listener for sorting by date
  document.getElementById('sort-date').addEventListener('change', function () {
    currentPage = 1; // reset to first page
    const sortBy = this.value;
    fetchCourses(document.getElementById('filter-category').value, sortBy);
  });
});

const itemsPerPage = 6;
let currentPage = 1;
let totalPages = 1;
let coursesData = [];

// ADDING CONTENT TO FILTER-CATEGORY 
async function filter() {
  try {
    const response = await fetch('/courses/categories');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const categories = await response.json();
    const filterCategory = document.getElementById('filter-category');

    // Clear existing options
    filterCategory.innerHTML = '<option value="all">All</option>';

    // Appending new categories
    categories.forEach(categoryContent => {
      const category = categoryContent.Category;
      const optionElement = document.createElement('option');
      optionElement.value = category;
      optionElement.textContent = category;
      filterCategory.appendChild(optionElement);
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

// PAGINATION
function updatePaginationControls() {
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const currentPageDisplay = document.getElementById('current-page');

  currentPageDisplay.textContent = currentPage;
  currentPage === 1 ? prevPageBtn.classList.add('disabled') : prevPageBtn.classList.remove('disabled');
  currentPage === totalPages ? nextPageBtn.classList.add('disabled') : nextPageBtn.classList.remove('disabled');
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    displayCourses();
  }
}

function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    displayCourses();
  }
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
  console.log('DELETE COURSE ID:', courseID);

  if (!confirm('Are you sure you want to delete this course?')) {
    return;
  }

  try {
    const response = await fetchWithAuth(`/courses/${courseID}`, { // ------------------------------------------------- headers in jwtutility.js
      method: 'DELETE'
    });
    console.log('PASSED HERE ');
    if (response.ok) { // response && response.ok
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
  if (!courseID) {
    alert('Course ID not found.');
    return;
  }
  try {
    const response = await fetchWithAuth(`/courses/${courseID}`); // ------------------------------------------------- headers in jwtutility.js
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const { course, userID: courseCreatorUserID } = await response.json();

    const userId = parseInt(sessionStorage.getItem('userId')); // current user's ID from session storage

    if (courseCreatorUserID !== userId) {
      alert('You do not have permission to edit this course.');
      return;
    }
    // Redirect to edit course page with courseID as query parameter
    window.location.href = `updateCourse.html?courseID=${courseID}`;
  } catch (error) {
    console.error('Error fetching course details:', error);
  }
}

function handleAddButtonVisibility() {
  const userRole = sessionStorage.getItem('role');
  const token = sessionStorage.getItem('token');

  if (token && userRole === 'lecturer') {
    document.querySelector('.add-button').style.display = 'block';
    document.querySelector('.delete-course').style.display = 'block';
    document.querySelector('.edit-course').style.display = 'block';
  } else {
    document.querySelector('.add-button').style.display = 'none';
    document.querySelector('.delete-course').style.display = 'none';
    document.querySelector('.edit-course').style.display = 'none';
  }
}

// SEARCH COURSES
async function searchCourses(event) {
  event.preventDefault(); // Prevent form submission
  const searchContainer = document.getElementById('search-course-input');
  const searchTitle = searchContainer.value.trim();
  console.log('SEARCH TITLE:', searchTitle);
  
  try {
    const response = await fetch(`/courses/search?term=${encodeURIComponent(searchTitle)}`);
    if (!response.ok) {
      throw new Error('Network response not ok');
    }
    const courses = await response.json();
    displayCourses(courses);
  } catch (error) {
    console.error('Error searching for courses: ', error);
    alert('Error searching for courses.');
  }
}

// Handle Enter key press in the search input field
document.getElementById('search-course-input').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent default action of Enter key (form submission)
    searchCourses(event); // Call your search function
  }
});

// REVIEW
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

