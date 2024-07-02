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
      console.log('Sending response:', course); // Log the response before sending
      res.json(course);
  } catch (error) {
      console.error('Error retrieving course:', error);
      res.status(500).json({ message: "Error retrieving course" });
  }
};



const createCourse = async (req, res) => {
  const newCourse = req.body;
  console.log('Request Body:', newCourse); // Log the request body

  if (req.file) {
      console.log('Course Image:', req.file); // Log the file details
      newCourse.courseImage = req.file.buffer; // Directly use the buffer from multer
  } else {
      console.log('Course Image not provided');
      return res.status(400).send("courseImage file not provided");
  }

  try {
      const createdCourse = await Courses.createCourse(newCourse);
      res.status(201).json(createdCourse);
  } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).send("Error creating course");
  }
};

const updateCourse = async (req, res) => {
  const courseID = parseInt(req.params.id);
  const newCourseData = req.body;

  try {
    const updatedCourse = await Courses.updateCourse(courseID, newCourseData);
    if (!updatedCourse) {
      return res.status(404).send("Course not found");
    }
    res.json(updatedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating course");
  }
  };
  const deleteCourseWithNoLectures = async (req,res)=>{
    try{
      const success = await Courses.deleteCourseWithNoLectures();
      if(!success){
        return res.status(404).send('Error deleting course with no lectures.')
      }
      res.status(204).send('Course deleted successfully!!')
    }catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting course with no lectures:(" });
    }
  };
  const deleteCourse = async (req, res) => {
    const courseID = parseInt(req.params.id);
  
    try {
      const success = await Courses.deleteCourse(courseID);
      console.log('DELETE SUCCESS:',success);
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