const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const path = require('path');
const dbConfig = require('./dbConfig');
const dotenv = require('dotenv');
// multer is for file uploading 
const multer = require('multer');

// Load environment variables from .env file
dotenv.config();

const userController = require('./controllers/userController');
const discussionController = require('./controllers/discussionController');
const commentController = require('./controllers/commentController');
const reviewController = require('./controllers/reviewController');
const courseController = require('./controllers/coursesController');
const lectureController = require('./controllers/lectureController');
const userValidation = require('./middleware/userValidation');
const updateValidation = require('./middleware/updateValidation');
// const jwtAuthorization = require('./middleware/authMiddleware');

const app = express();
const port = process.env.PORT || 3000;

// Set up the view engine
app.set('view engine', 'ejs');

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const multiUpload = upload.fields([
    { name: 'Video', maxCount: 1 },
    { name: 'LectureImage', maxCount: 1 },
    {name : 'courseImage', maxCount : 1}
]);

// Middleware to ignore favicon requests
app.get('/favicon.ico', (req, res) => res.status(204));

// Include body-parser middleware to handle JSON data
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Add Routes for users
app.post('/account/uploadProfilePic/:id', /*jwtAuthorization.verifyJWT,*/ userController.updateProfilePic);
app.get('/account/profile/:id', userController.getProfilePicByUserId);

app.put('/account/:id', updateValidation, userController.updateUser);
app.post('/users/register', userValidation, userController.createUser);
app.post('/users/login', userController.loginUser);
app.get('/account/:id', userController.getUserById);
app.delete('/account/:id', userController.deleteUser);

// Add Routes for discussions
app.get('/discussions', discussionController.getDiscussions);
app.get('/discussions/user/:userId', discussionController.getDiscussionsByUser);
app.get('/discussions/:id', discussionController.getDiscussionById);
app.post('/discussions', discussionController.createDiscussion);
app.put('/discussions/:id', discussionController.updateDiscussion);
app.delete('/discussions/:id', discussionController.deleteDiscussion);

// Add Routes for comments
app.get('/comments', commentController.getComments);
app.put('/comments/:id', commentController.updateComment);
app.post('/comments', commentController.createComment); 
app.delete('/comments/:id', commentController.deleteComment);

// Add Routes for reviews
app.get('/reviews', reviewController.getReviews);
app.put('/reviews/:id', reviewController.updateReview);
app.post('/reviews', reviewController.createReview); 
app.delete('/reviews/:id', reviewController.deleteReview);

// Add Routes for courses
app.get('/courses', courseController.getAllCourses);
app.get('/courses/:id', courseController.getCoursesById);
app.get('/courses/image/:id', courseController.getCourseImage);
app.put('/courses/:id', courseController.updateCourse);
app.post('/courses', upload.single('imageFile'), courseController.createCourse); // Ensure field name matches
app.delete('/courses/:id', courseController.deleteCourse);
app.delete('/courses/noLectures',courseController.deleteCourseWithNoLectures);

// Add Routes for lectures
app.get('/lectures', lectureController.getAllLectures); // Fetches all lectures
app.get('/lectures/course/:courseID', lectureController.getLecturesByCourseID);
app.get('/video/:lectureID', lectureController.getLectureVideoByID); // Fetches the video for a specific lecture by lecture ID
app.get('/lectures/max-course-id', lectureController.getMaxCourseID); // Getting the new course ID
app.put('/lectures/:id', lectureController.updateLecture); 
app.post('/lectures', multiUpload, lectureController.createLecture);
app.delete('/lectures/:id', lectureController.deleteLecture); 
app.get('/lectures/last-chapter/:id', lectureController.getLastChapterName); // Fetches the last chapter name for a specific user ID


app.listen(port, async () => {
    try {
        await sql.connect(dbConfig);
        console.log("Database connection established successfully");
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }

    console.log(`Server listening on port ${port}`);
});

process.on("SIGINT", async () => {
    console.log("Server is gracefully shutting down");
    await sql.close();
    console.log("Database connection closed");
    process.exit(0);
});
