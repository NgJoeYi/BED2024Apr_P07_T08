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
      const upadtedCourse = await Courses.updateCourse(courseID, newCourseData);
      if (!upadtedCourse) {
        return res.status(404).send("Course not found");
      }
      res.json(upadtedCourse);
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

  module.exports = {
    getAllCourses,
    getCoursesById,
    createCourse,
    updateCourse,
    deleteCourse
  }