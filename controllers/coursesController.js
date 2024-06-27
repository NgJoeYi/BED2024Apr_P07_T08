const Courses = require("../models/courses");
const sql = require("mssql");

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
  if (req.file) {
      newCourse.courseImage = fs.readFileSync(req.file.path);
      fs.unlinkSync(req.file.path); // Clean up the temp file
  }

  try {
      const createdCourse = await Courses.createCourse(newCourse);
      res.status(201).json(createdCourse);
  } catch (error) {
      console.error(error);
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

const deleteCourse = async (req, res) => {
  const courseID = parseInt(req.params.id);

  try {
    const success = await Courses.deleteCourse(courseID);
    if (!success) {
      return res.status(404).send("Course not found");
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting course");
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
  getCourseImage
  }