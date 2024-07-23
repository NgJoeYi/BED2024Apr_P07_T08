const Courses = require("../models/courses");
const sql = require("mssql");
const multer = require("multer");

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: A list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       500:
 *         description: Error retrieving courses
 */
const getAllCourses = async (req, res) => {
  try {
    const courses = await Courses.getAllCourses();
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving courses");
  }
};

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The course ID
 *     responses:
 *       200:
 *         description: The course description by ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *                 userID:
 *                   type: integer
 *       404:
 *         description: Course not found
 *       500:
 *         description: Error retrieving course
 */
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

/**
 * @swagger
 * /courses/categories:
 *   get:
 *     summary: Get all course categories
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       404:
 *         description: Categories not found
 *       500:
 *         description: Error retrieving categories
 */
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

/**
 * @swagger
 * /courses/filter:
 *   get:
 *     summary: Filter courses by category
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: The category to filter by
 *     responses:
 *       200:
 *         description: A list of courses in the category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       404:
 *         description: Courses not found
 *       500:
 *         description: Error retrieving courses by category
 */
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

/**
 * @swagger
 * /courses/mostRecent:
 *   get:
 *     summary: Get the most recent courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: A list of the most recent courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       404:
 *         description: Most recent courses not found
 *       500:
 *         description: Error retrieving recent courses
 */
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

/**
 * @swagger
 * /courses/earliest:
 *   get:
 *     summary: Get the earliest courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: A list of the earliest courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       404:
 *         description: Earliest courses not found
 *       500:
 *         description: Error retrieving earliest courses
 */
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

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               courseImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Course image not provided
 *       500:
 *         description: Error creating course
 */
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

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The course ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               courseImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       404:
 *         description: Course not found
 *       500:
 *         description: Error updating course
 */
const updateCourse = async (req, res) => {
  const userID = req.user.id; // user id that logged on now
  const courseID = parseInt(req.params.id);
  const newCourseData = req.body;

  console.log('Update course request received for courseID:', courseID); // Log course ID
  console.log('Request body:', newCourseData); // Log the request body

  try {
    // If no new image is uploaded, retain the current image
    if (!req.file) {
      console.log('DIDNT CHANGE IMAGE');
      const existingCourse = await Courses.getCourseById(courseID);
      if (!existingCourse) {
        return res.status(404).send("Course not found");
      }
      newCourseData.courseImage = existingCourse.courseImage;
      console.log('EXISTING COURSE: ', existingCourse);
      console.log('OLD IMAGE:', newCourseData.courseImage);
    } else {
      console.log('IMAGE CHANGED');
      newCourseData.courseImage = req.file.buffer;
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

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The course ID
 *     responses:
 *       204:
 *         description: Course deleted successfully
 *       403:
 *         description: You do not have permission to delete this course
 *       404:
 *         description: Course not found
 *       500:
 *         description: Error deleting course
 */
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

/**
 * @swagger
 * /courses/noLectures:
 *   delete:
 *     summary: Delete courses with no lectures
 *     tags: [Courses]
 *     responses:
 *       204:
 *         description: Courses deleted successfully
 *       404:
 *         description: No courses with no lectures found
 *       500:
 *         description: Error deleting courses with no lectures
 */
const deleteCourseWithNoLectures = async (req, res) => {
  try {
    const success = await Courses.deleteCourseWithNoLectures();
    console.log('success of deleting courses with no lectures:', success);
    if (!success) {
      console.log('No courses were deleted.'); // Log if no courses were deleted
      return res.status(404).json({ message: 'No courses with no lectures found.' });
    }
    console.log('Courses with no lectures deleted successfully.'); // Log success
    res.status(204).send('Course deleted successfully!!');
  } catch (error) {
    console.error('Error deleting course with no lectures:', error);
    res.status(500).json({ message: "Error deleting course with no lectures:(" });
  }
};

/**
 * @swagger
 * /courses/image/{id}:
 *   get:
 *     summary: Retrieve the image for a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The course ID
 *     responses:
 *       200:
 *         description: The image for the course
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found
 *       500:
 *         description: Error fetching course image
 */
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

/**
 * @swagger
 * /courses/search:
 *   get:
 *     summary: Search for courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: term
 *         required: true
 *         schema:
 *           type: string
 *         description: The search term
 *     responses:
 *       200:
 *         description: A list of courses matching the search term
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       400:
 *         description: Search term is required
 *       404:
 *         description: No courses found
 *       500:
 *         description: Error searching for courses
 */
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
