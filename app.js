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
const quizController = require('./controllers/quizController');
const discussionController = require('./controllers/discussionController');
const commentController = require('./controllers/commentController');
const reviewController = require('./controllers/reviewController');
const courseController = require('./controllers/coursesController');
const lectureController = require('./controllers/lectureController');
const userValidation = require('./middleware/userValidation');
const updateValidation = require('./middleware/updateValidation');
const jwtAuthorization = require('./middleware/authMiddleware');

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

// Add Routes for log in & register
app.post('/register', userValidation, userController.createUser);
app.post('/login', userController.loginUser);

// Add Routes for account management
app.get('/account', jwtAuthorization.verifyJWT,userController.getUserById);
app.post('/account/uploadProfilePic', jwtAuthorization.verifyJWT, userController.updateProfilePic);
app.get('/account/profile', jwtAuthorization.verifyJWT, userController.getProfilePicByUserId);
app.put('/account', jwtAuthorization.verifyJWT, updateValidation, userController.updateUser);
app.delete('/account', jwtAuthorization.verifyJWT,userController.deleteUser);

// Add Routes for quizzes
app.get('/quizzes', quizController.getAllQuizWithCreatorName);
app.get('/quizzes/:id', quizController.getQuizById);
app.post('/quizzes', quizController.createQuiz);
app.put('/quizzes/:id', quizController.updateQuiz);
app.delete('/quizzes/:id', quizController.deleteQuiz);

// Add Routes for quiz questions 
app.get('/quizzes/:id/questions', quizController.getQuizWithQuestions);

// Add Routes for discussions
app.get('/discussions', discussionController.getDiscussions);
app.get('/discussions/user', jwtAuthorization.verifyJWT, discussionController.getDiscussionsByUser);
app.get('/discussions/:id', jwtAuthorization.verifyJWT, discussionController.getDiscussionById);
app.post('/discussions', jwtAuthorization.verifyJWT, discussionController.createDiscussion);
app.put('/discussions/:id', jwtAuthorization.verifyJWT, discussionController.updateDiscussion);
app.delete('/discussions/:id', jwtAuthorization.verifyJWT, discussionController.deleteDiscussion);

// Add Routes for comments
app.get('/comments', commentController.getComments);
app.get('/comments/count', commentController.getCommentCount);  //Will get total comments in total, but to specify each discussion how much comments is in Js bc then would get comments by discussionId to display number of comments etc
app.put('/comments/:id', jwtAuthorization.verifyJWT, commentController.updateComment);
app.post('/comments', jwtAuthorization.verifyJWT, commentController.createComment); 
app.delete('/comments/:id', jwtAuthorization.verifyJWT, commentController.deleteComment);

// Add Routes for reviews
app.get('/reviews', reviewController.getReviews);
app.put('/reviews/:id', reviewController.updateReview);
app.post('/reviews', reviewController.createReview); 
app.delete('/reviews/:id', reviewController.deleteReview);

// Add Routes for courses
app.get('/courses', courseController.getAllCourses);
app.get('/courses/:id', courseController.getCoursesById);
app.get('/courses/image/:id', courseController.getCourseImage);
app.put('/courses/:id', upload.single('courseImage'), courseController.updateCourse);
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
app.delete('/lectures/course/:courseID/chapter/:chapterName', lectureController.deletingChapterName); // Updated route
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
