// Feature 5: Popup functionality
// Define the popup functions outside the conditional block
function openPopup() {
    if (document.querySelectorAll('.popup').length > 0) {
      document.querySelector(".popup").style.display = "block";
    }
  }
  
  function closePopup() {
    if (document.querySelectorAll('.popup').length > 0) {
      document.querySelector(".popup").style.display = "none";
    }
  }
  
  if (document.querySelectorAll('.popup').length > 0) {
    window.addEventListener("load", function() {
      setTimeout(function() {
        openPopup();
      }, 2000);
    });
  
    document.querySelector(".close").addEventListener("click", function() {
      closePopup();
    });
  }
  
  // Feature 3: Image filtering functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterCategory = document.getElementById('filter-category');
    const sortDate = document.getElementById('sort-date');
    const coursesGrid = document.querySelector('.courses-grid-unique');
    const courses = Array.from(document.querySelectorAll('.course-cd-unique'));
  
    function filterAndSortCourses() {
        const categoryValue = filterCategory.value;
        const sortValue = sortDate.value;
  
        // Filter courses by category
        const filteredCourses = courses.filter(course => {
            if (categoryValue === 'all') {
                return true;
            } else {
                return course.getAttribute('data-category') === categoryValue;
            }
        });
  
        // Sort courses by date
        const sortedCourses = filteredCourses.sort((a, b) => {
            const dateA = new Date(a.getAttribute('data-date'));
            const dateB = new Date(b.getAttribute('data-date'));
  
            if (sortValue === 'most-recent') {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });
  
        // Clear the course grid and append the sorted courses
        coursesGrid.innerHTML = '';
        sortedCourses.forEach(course => {
            coursesGrid.appendChild(course);
        });
    }
  
    filterCategory.addEventListener('change', filterAndSortCourses);
    sortDate.addEventListener('change', filterAndSortCourses);
  });
  





    // shoe, acvtivtyfeed
// Function to filter and sort the posts
function filterAndSortPosts() {
    const categoryFilter = document.getElementById('filter-category').value;
    const sortOption = document.getElementById('sort-date').value;
  
    const posts = document.querySelectorAll('.post');
  
    // Filter posts by category
    posts.forEach(post => {
        const postCategory = post.querySelector('.category').textContent.toLowerCase().replace('category: ', '');
        if (categoryFilter === 'all' || postCategory === categoryFilter) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
  
  
  
    // Sort posts by date
    const sortedPosts = Array.from(posts).sort((a, b) => {
        const dateA = new Date(a.querySelector('.posted-date-activity').textContent.replace('Posted on: ', ''));
        const dateB = new Date(b.querySelector('.posted-date-activity').textContent.replace('Posted on: ', ''));
        return sortOption === 'most-recent' ? dateB - dateA : dateA - dateB;
    });
  
    // Reorder posts in the DOM
    const activityFeed = document.querySelector('.activity-feed');
    activityFeed.innerHTML = '';
    sortedPosts.forEach(post => {
        activityFeed.appendChild(post);
    });
  }
  
  // Event listeners for filter and sort dropdowns
  document.getElementById('filter-category').addEventListener('change', filterAndSortPosts);
  document.getElementById('sort-date').addEventListener('change', filterAndSortPosts);
  
  // Initial filter and sort on page load
  filterAndSortPosts();