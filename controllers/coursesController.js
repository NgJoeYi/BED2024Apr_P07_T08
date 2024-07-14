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

// for filtering  by category
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

 // for filtering by most recent on top
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

 // for filtering by earliest on top 
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
        console.log('EXISTING COURSE: ',existingCourse);
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
  
// retreive specific image 
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

const searchCourses = async (req, res) => {
  try {
    const searchTerm = req.query.term;
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    const courses = await Courses.searchCourses(searchTerm);
    if (!courses.length) {
      return res.status(404).json({ message: 'No courses found' });
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
  }