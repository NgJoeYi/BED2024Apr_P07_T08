const Courses = require("../models/courses");
const sql = require("mssql");
const multer = require("multer");

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const getAllCourses = async (req, res) => {
    try {
      const courses = await Courses.getAllCourses();
      res.json(courses);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving courses");
    }
};


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



const createCourse = async (req, res) => {
  const newCourse = req.body;
  const userID = req.user.id;
  
  if (req.file) {
      newCourse.courseImage = req.file.buffer; // Directly use the buffer from multer
  } else {
      console.log('Course Image not provided');
      return res.status(400).send("courseImage file not provided");
  }

  try {
      const createdCourse = await Courses.createCourse(newCourse,userID);
      res.status(201).json(createdCourse);
  } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).send("Error creating course");
  }
};

const updateCourse = async (req, res) => {
  userID = req.user.id; // user id that log on now 
  const courseID = parseInt(req.params.id);
  const newCourseData = req.body;

  console.log('Update course request received for courseID:', courseID); // Log course ID
  console.log('Request body:', newCourseData); // Log the request body

  try {
      const updatedCourse = await Courses.updateCourse(courseID, newCourseData);
      if (!updatedCourse) {
          return res.status(404).send("Course not found");
      }
      res.json(updatedCourse,userID);
  } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).send("Error updating course");
  }
};
const deleteCourseWithNoLectures = async (req, res) => {
  try {
    const success = await Courses.deleteCourseWithNoLectures();
    if (!success) {
      console.log('No courses were deleted.'); // Log if no courses were deleted
      return res.status(404).send('Error deleting course with no lectures.');
    }
    console.log('Courses with no lectures deleted successfully.'); // Log success
    res.status(204).send('Course deleted successfully!!');
  } catch (error) {
    console.error('Error deleting course with no lectures:', error);
    res.status(500).json({ message: "Error deleting course with no lectures:(" });
  }
};


  const deleteCourse = async (req, res) => {
    const courseID = parseInt(req.params.id);
  
    try {
      const success = await Courses.deleteCourse(courseID);
      if (!success) {
        return res.status(404).json({ message: "Course not foundd" });
      }
      res.status(204).json({ message: "Course deleted successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting course :(" });
    }
  };
  
  
const getCourseImage = async (req, res) => {
  const courseID = parseInt(req.params.id);
  try {
    const imageBuffer = await Courses.getCourseImage(courseID);
    if (!imageBuffer) {
      return res.status(404).send('Image not found');
    }
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error fetching course image:', error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllCourses,
  getCoursesById,
  createCourse,
  updateCourse,
  deleteCourse,
  deleteCourseWithNoLectures,
  getCourseImage
  }