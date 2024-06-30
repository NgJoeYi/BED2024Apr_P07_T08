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
const lecturerController = require('./controllers/lecturerController');

const userValidation = require('./middleware/userValidation');
const updateValidation = require('./middleware/updateValidation');
const deleteValidation = require('./middleware/deleteValidation');

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
    { name: 'LectureImage', maxCount: 1 }
]);

// Include body-parser middleware to handle JSON data
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Add Routes for users
app.post('/account/uploadProfilePic/:id', userController.updateProfilePic);
app.get('/account/profile/:id', userController.getProfilePicByUserId);

app.get('/current-user', userController.getCurrentUser);
app.put('/account/:id', updateValidation, userController.updateUser);
app.post('/users/register', userValidation, userController.createUser);
app.post('/users/login', userController.loginUser);
app.get('/account/:id', userController.getUserById);
app.delete('/account/:id', /*deleteValidation,*/ userController.deleteUser);

// Add Routes for discussions
app.get('/discussions', discussionController.getDiscussions);
app.get('/discussions/user/:userId', discussionController.getDiscussionsByUser);
app.get('/discussions/:id', discussionController.getDiscussionById);
app.post('/discussions', discussionController.createDiscussion);
app.put('/discussions/:id', discussionController.updateDiscussion);
app.delete('/discussions/:id', discussionController.deleteDiscussion);

// Add Routes for comments
app.get('/comments', commentController.getComments);
app.get('/comments?discussionId=:discussionId', commentController.getComments);
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
app.get('/courses/:id' , courseController.getCoursesById);
app.get('/courses/image/:id', courseController.getCourseImage);
app.put('/courses/:id', courseController.updateCourse);
app.post('/courses', upload.single('courseImage'), courseController.createCourse);
app.delete('/courses/:id', courseController.deleteCourse);

// Add Routes for lectures
app.get('/lectures', lectureController.getAllLectures);
app.get('/lectures/:id', lectureController.getLectureByID);
app.put('/lectures/:id', lectureController.updateLecture);
app.post('/lectures', multiUpload, lectureController.createLecture); // Removed ensureLoggedIn
app.delete('/lectures/:id', lectureController.deleteLecture);
app.get('/lectures/last-chapter/:id', lectureController.getLastChapterName); 

// Add Routes for lecturer
app.get('/lecturer', lecturerController.getAllLecturers);
app.get('/lecturer/:id' , lecturerController.getLecturerByID);
app.put('/lecturer/:id', lecturerController.updateLecturer);
app.post('/lecturer', lecturerController.createLecturer); 
app.delete('/lecturer/:id', lecturerController.deleteLecturer);

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
