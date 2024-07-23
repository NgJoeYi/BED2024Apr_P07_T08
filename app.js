const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const path = require('path');
const dbConfig = require('./dbConfig');
const dotenv = require('dotenv');
// multer is for file uploading 
const multer = require('multer');


//implemented swagger 
const swaggerUi = require("swagger-ui-express"); 
const swaggerDocument = require("./swagger-output.json"); // Import generated spec 



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
const quizValidation = require('./middleware/quizzesMiddleware');
const jwtAuthorization = require('./middleware/authMiddleware');
const commentValidation = require('./middleware/commentValidation');
const reviewValidation = require('./middleware/reviewValidation'); 

const app = express();
const port = process.env.PORT || 3000;

// to use swagger..
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // so in search bar type: localhost:3000/api-docs 

// Set up the view engine
app.set('view engine', 'ejs');

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const multiUpload = upload.fields([
    { name: 'lectureVideo', maxCount: 1 },
    { name: 'LectureImage', maxCount: 1 },
    { name: 'courseImage', maxCount: 1 },
    { name: 'videoFiles' , maxCount : 1 },
    { name: 'Video', maxCount: 1 },
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
app.get('/account/profile', jwtAuthorization.verifyJWT, userController.getProfilePicByUserId);
app.get('/account/getAllAttemptCount', jwtAuthorization.verifyJWT, quizController.getAllAttemptCount);  // quiz related
app.get('/account/getAttemptCountByQuizId', jwtAuthorization.verifyJWT, quizController.getAttemptCountByQuizId);  // quiz related
app.get('/account/quizResult', jwtAuthorization.verifyJWT, quizController.getAllQuizResultsForUser); // question related
app.post('/account/uploadProfilePic', jwtAuthorization.verifyJWT, userController.updateProfilePic);
app.put('/account', jwtAuthorization.verifyJWT, updateValidation, userController.updateUser);
app.delete('/account', jwtAuthorization.verifyJWT,userController.deleteUser);

// Add Routes for quizzes
app.get('/quizzes/statistics', quizController.getQuizPassFailStatistics); // users not logged in can see
app.get('/quizzes', quizController.getAllQuizWithCreatorName); // users not logged in can see
app.get('/quizzes/:id', jwtAuthorization.verifyJWT, quizController.getQuizById);
app.get('/quizzes/:id/questions', jwtAuthorization.verifyJWT, quizController.getQuizWithQuestions); // question related
app.get('/quizResult/:attemptId', jwtAuthorization.verifyJWT, quizController.getUserQuizResult); // question related
app.post('/quizzes', jwtAuthorization.verifyJWT, quizValidation.validateCreateQuiz, quizController.createQuiz);
app.post('/submitQuiz', jwtAuthorization.verifyJWT, quizController.submitQuiz); // question related
app.post('/quizzes/:id/questions', jwtAuthorization.verifyJWT, quizValidation.validateCreateQuestion, quizController.createQuestionAfterQuizCreation); // question form AFTER quiz creation // quiz.js
app.post('/quizzes/:id/questions/update', jwtAuthorization.verifyJWT, quizValidation.validateCreateQuestion, quizController.createQuestionOnUpdate); // question form DURING edit question // editQuestion.js
app.put('/quizzes/:id', jwtAuthorization.verifyJWT, quizValidation.validateUpdateQuiz, quizController.updateQuiz); // edit quiz
app.put('/quizzes/:quizId/questions/:questionId', jwtAuthorization.verifyJWT, quizController.updateQuestion); // edit question
app.delete('/quizzes/:id', jwtAuthorization.verifyJWT, quizController.deleteQuiz);
app.delete('/quizzes/:quizId/questions/:questionId', jwtAuthorization.verifyJWT, quizController.deleteQuestion); // delete question

// Add Routes for discussions
app.get('/discussions', discussionController.getDiscussions);
app.get('/discussions/user', jwtAuthorization.verifyJWT, discussionController.getDiscussionsByUser);
app.get('/discussions/:id', jwtAuthorization.verifyJWT, discussionController.getDiscussionById);
app.post('/discussions', jwtAuthorization.verifyJWT, discussionController.validateDiscussion, discussionController.createDiscussion);  //add validation for create 
app.put('/discussions/:id', jwtAuthorization.verifyJWT, discussionController.validateDiscussion, discussionController.updateDiscussion);   //add validation for update 
app.delete('/discussions/:id', jwtAuthorization.verifyJWT, discussionController.deleteDiscussion);
app.post('/discussions/:discussionId/like', jwtAuthorization.verifyJWT, discussionController.incrementLikes);
app.post('/discussions/:discussionId/dislike', jwtAuthorization.verifyJWT, discussionController.incrementDislikes);

// what i added extra - discussion
app.post('/discussions/:discussionId/view', jwtAuthorization.verifyJWT, discussionController.incrementViews);
app.post('/discussions/:id/pin', jwtAuthorization.verifyJWT, discussionController.pinDiscussion);
app.post('/discussions/:id/unpin', jwtAuthorization.verifyJWT, discussionController.unpinDiscussion);

// Add Routes for comments
app.get('/comments', commentController.getComments);
app.get('/comments/count', commentController.getCommentCount); 
app.get('/comments/discussion/:discussionId/count', commentController.getCommentCountByDiscussionId);
app.put('/comments/:id', jwtAuthorization.verifyJWT, commentValidation, commentController.updateComment);
app.post('/comments', jwtAuthorization.verifyJWT, commentValidation, commentController.createComment);
app.post('/comments/:commentId/like', commentController.incrementLikes); // Dont need jwtAuthorzation middleware bc when not logged in, user unable to go to comments page.
app.post('/comments/:commentId/dislike', commentController.incrementDislikes);
app.delete('/comments/:id', jwtAuthorization.verifyJWT, commentController.deleteComment);

// Add Routes for reviews
app.get('/reviews', reviewController.getReviews); //Here alr have default filter to ALL and default sort to MOST RECENT
app.get('/reviews/rating/:rating', reviewController.getReviewsByRating); // Filter by specific rating eg 5 stars, then will only show 5 stars
app.get('/reviews/sort/:sort', reviewController.getReviewsSortedByRating); // Sort by specific rating eg by most recent. highest to lowest rating eg http://localhost:3000/reviews/sort/highestRating
app.get('/reviews/course/:courseId', reviewController.getReviewsByCourseId); // Filter by specific course ID
app.get('/reviews/course/:courseId/rating/:rating', reviewController.getReviewsByCourseIdAndRating); // Filter by course ID and rating
app.get('/reviews/course/:courseId/sort/:sort', reviewController.getReviewsByCourseIdAndSort); // Filter by course ID and sort
app.get('/reviews/count', reviewController.getReviewCount); 
app.get('/reviews/course/:courseId/count', reviewController.getReviewCountByCourseId);
app.get('/reviews/user/:userId/count', reviewController.getReviewCountByUserId);
app.put('/reviews/:id', jwtAuthorization.verifyJWT, reviewValidation, reviewController.updateReview);
app.post('/reviews', jwtAuthorization.verifyJWT, reviewValidation, reviewController.createReview);
app.post('/reviews/:reviewId/like', reviewController.incrementLikes); // Dont need jwtAuthorzation middleware bc when not logged in, user unable to go to courses page aka where the reviews are.
app.post('/reviews/:reviewId/dislike', reviewController.incrementDislikes);
app.delete('/reviews/:id', jwtAuthorization.verifyJWT, reviewController.deleteReview); // -- jwt

// Add Routes for courses
app.get('/courses/search', courseController.searchCourses);
app.get('/courses', courseController.getAllCourses);
app.get('/courses/categories',courseController.getAllCategories); // for filtering by category4
app.get('/courses/filter', courseController.filterByCategory);
app.get('/courses/mostRecent',courseController.getMostRecentCourses); // for filtering by most recent made courses
app.get('/courses/earliest',courseController.getEarliestCourses); // for filtering by earliest made courses
app.get('/courses/:id', courseController.getCoursesById);
app.get('/courses/image/:id', courseController.getCourseImage);
app.put('/courses/:id', jwtAuthorization.verifyJWT, upload.single('courseImage'), courseController.updateCourse);
app.post('/courses', jwtAuthorization.verifyJWT, upload.single('imageFile'), courseController.createCourse); // Ensure field name matches
app.delete('/courses/noLectures', jwtAuthorization.verifyJWT, courseController.deleteCourseWithNoLectures);
app.delete('/courses/:id', jwtAuthorization.verifyJWT, courseController.deleteCourse);


// Add Routes for lectures
app.get('/lectures/checking', jwtAuthorization.verifyJWT, lectureController.checkingUserID); // get current user ID 
app.get('/lectures/last-chapter', jwtAuthorization.verifyJWT, lectureController.getLastChapterName); // Fetches the last chapter name for a specific user ID
app.get('/lectures', lectureController.getAllLectures); // Fetches all lectures
app.get('/lectures/max-course-id', lectureController.getMaxCourseID); // Getting the new course ID
app.get('/lectures/course/:courseID', lectureController.getLecturesByCourseID);
app.get('/lectures/:id', lectureController.getLectureByID); 
app.get('/lectures/lecture-details/:id',lectureController.getLectureDetails);
app.put('/lectures/:id', jwtAuthorization.verifyJWT, upload.single('lectureVideo'), lectureController.updateLecture);
app.get('/video/:lectureID', lectureController.getLectureVideoByID); // for updating lecture
app.post('/lectures', jwtAuthorization.verifyJWT, multiUpload, lectureController.createLecture);
app.delete('/lectures/:id', jwtAuthorization.verifyJWT, lectureController.deleteLecture); 
app.delete('/lectures/course/:courseID/chapter/:chapterName', jwtAuthorization.verifyJWT, lectureController.deletingChapterName); 



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
