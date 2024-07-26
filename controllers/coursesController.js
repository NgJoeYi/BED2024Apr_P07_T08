const Courses = require("../models/courses");
const sql = require("mssql");
const multer = require("multer");
const path = require('path');
const fs = require('fs');

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// For displaying all courses 
const getAllCourses = async (req, res) => {
  try {
    const courses = await Courses.getAllCourses();
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving courses");
  }
};

// getting specific course by ID 
const getCoursesById = async (req, res) => {
  const courseID = parseInt(req.params.id);
  try {
    const course = await Courses.getCourseById(courseID);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ course, userID: course.userID });
  } catch (error) {
    console.error('Error retrieving course:', error);
    res.status(500).json({ message: "Error retrieving course" });
  }
};

// Getting all the categories to filter from  
const getAllCategories = async (req, res) => {
  try {
    const categories = await Courses.getAllCategories();
    if (!categories) {
      return res.status(404).json({ message: "Categories not found" });
    }
    res.json(categories);
  } catch (error) {
    console.error('Error retrieving categories:', error);
    res.status(500).json({ message: "Error retrieving categories" });
  }
};

// actual filter for category 
const filterByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    const courses = await Courses.filterByCategory(category);
    if (!courses) {
      return res.status(404).json({ message: "Courses not found" });
    }
    res.json(courses);
  } catch (error) {
    console.error('Error retrieving courses by category:', error);
    res.status(500).json({ message: "Error retrieving courses by category" });
  }
};

// For filtering by recent courses 
const getMostRecentCourses = async(req,res)=>{
  try{
    const categories = await Courses.getMostRecentCourses();
    if(!categories){
      return res.status(404).json({ message: "Most recent courses not found" });
    }
    res.json(categories);
  }catch(error){
    console.error('Error retrieving recent courses:', error);
    res.status(500).json({ message: "Error retrieving recent courses" });
  }
}

// For filtering by earliest courses 
const getEarliestCourses = async(req,res)=>{
  try{
    const categories = await Courses.getEarliestCourses();
    if(!categories){
      return res.status(404).json({ message: "Most earliest courses not found" });
    }
    res.json(categories);
  }catch(error){
    console.error('Error earliest recent courses:', error);
    res.status(500).json({ message: "Error earliest recent courses" });
  }
}

// Create a new course
const createCourse = async (req, res) => {
  const { title, description, category, level, duration } = req.body;
  const UserID = req.user.id;
  if (!UserID) {
    console.error("UserID not provided");
    return res.status(400).send("UserID not provided");
  }

  if (!req.file) {
    console.error("Course image not provided");
    return res.status(400).send("Course image not provided");
  }

  const courseImageFilename = req.file.filename;

  try {
    const newCourseData = {
      UserID,
      title,
      description,
      category,
      level,
      duration,
      CourseImage: courseImageFilename, // Only the filename is saved
    };
    const newCourseID = await Courses.createCourse(newCourseData);
    res.status(201).json({ CourseID: newCourseID, ...newCourseData });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).send('Error creating course');
  }
};

// get course image
const getCourseImage = (req, res) => {
  const imageFilename = req.params.filename.trim();
  const imagePath = path.resolve(__dirname, '..', 'public', 'courseImages', imageFilename);

  console.log('Normalized path to file:', imagePath);

  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File does not exist:', imagePath);
      return res.status(404).send('Image not found');
    }

    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error('Error sending image file:', err);
        res.status(404).send('Image not found');
      }
    });
  });
};

// Update course if the user has permission 
const updateCourse = async (req, res) => {
  const userID = req.user.id; // user id that logged on now
  const courseID = parseInt(req.params.id);
  const newCourseData = req.body;

  console.log('Update course request received for courseID:', courseID); // Log course ID
  console.log('Request body:', newCourseData); // Log the request body

  try {
    // If no new image is uploaded, retain the current image
    if (!req.file && req.body.noImageChange === 'true') {
      console.log('No new image provided');
      const existingCourse = await Courses.getCourseById(courseID);
      if (!existingCourse) {
        return res.status(404).send("Course not found");
      }
      newCourseData.courseImage = existingCourse.courseImage;
      console.log('Existing course:', existingCourse);
      console.log('Old image:', newCourseData.courseImage);
    } else if (req.file) {
      console.log('New image provided');
      // Save the new image
      newCourseData.courseImage = req.file.filename; // Update filename or process as needed
    }

    const updatedCourse = await Courses.updateCourse(courseID, newCourseData);
    if (!updatedCourse) {
      return res.status(404).send("Course not found");
    }
    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).send("Error updating course");
  }
};


// Deleting course if the user has permission 
const deleteCourse = async (req, res) => {
  const courseID = parseInt(req.params.id);
  const userID = req.user.id; 
  try {
    const course = await Courses.getCourseById(courseID);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if the user is the creator of the course
    if (course.userID !== userID) {
      return res.status(403).json({ message: "You do not have permission to delete this course" });
    }

    const success = await Courses.deleteCourse(courseID);
    if (!success) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(204).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting course" });
  }
};

// If user creates course but exists the page the course will not be created successfully
// dont have status 404 because we cant find a course with no lecture to delete everytime
const deleteCourseWithNoLectures = async (req, res) => {
  try {
    const success = await Courses.deleteCourseWithNoLectures();
    console.log('success of deleting courses with no lectures:', success);
    if (!success) {
      console.log('No courses were deleted.'); // Log if no courses were deleted
      return res.status(204).send('No courses with no lectures found.'); // Use 204 No Content
    }
    console.log('Courses with no lectures deleted successfully.'); // Log success
    res.status(204).send('Course deleted successfully!!');
  } catch (error) {
    console.error('Error deleting course with no lectures:', error);
    res.status(500).json({ message: "Error deleting course with no lectures:(" });
  }
};


// For users to search for courses in the search container 
const searchCourses = async (req, res) => {
  try {
    const searchTerm = req.query.term;
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    const courses = await Courses.searchCourses(searchTerm);
    if (!courses.length) {
      return res.status(404).json({ message: 'No courses found please enter properly' });
    }
    res.json(courses);
  } catch (error) {
    console.error('Error searching for courses:', error);
    res.status(500).json({ message: 'Error searching for courses' });
  }
};

module.exports = {
  getAllCourses,
  getCoursesById,
  getAllCategories,
  filterByCategory,
  getMostRecentCourses,
  getEarliestCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  deleteCourseWithNoLectures,
  getCourseImage,
  searchCourses
};
