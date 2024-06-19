const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const dbConfig = require('./dbConfig');
const userController = require('./controllers/userController');
const discussionController = require('./controllers/discussionController');
<<<<<<< HEAD
const courseController = require("./controllers/coursesController");
// const methodOverride = require('method-override');
=======
const commentController = require('./controllers/commentController');
>>>>>>> 61b199b1c8bdd77dd46b33bb553e7e293bf605a4

const app = express();
const port = process.env.PORT || 3000; // Use environment variable/default port

// Set up the view engine
app.set('view engine', 'ejs');

// Serve static files from the public directory
app.use(express.static('public'));

// Include body-parser middleware to handle JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling

// Add Routes for users
app.post('/users/register', userController.createUser);
app.post('/users/login', userController.loginUser);

// Add Routes for discussions
app.get('/discussions', discussionController.getDiscussions);
app.post('/discussions', discussionController.createDiscussion);
app.get('/discussions/:id/edit', discussionController.getDiscussionById);
app.put('/discussions/:id', discussionController.updateDiscussion);
app.delete('/discussions/:id', discussionController.deleteDiscussion);

<<<<<<< HEAD
// Add Routes for courses
app.get('/courses', courseController.getAllCourses);
app.get('/courses/:id', courseController.getCoursesById);
app.post('/courses', courseController.createCourse);
app.put('/courses/:id', courseController.updateCourse);
app.delete('/courses/:id', courseController.deleteCourse);
=======
// Add Routes for comments
app.get('/comments', commentController.getComments);
>>>>>>> 61b199b1c8bdd77dd46b33bb553e7e293bf605a4

app.listen(port, async () => {
  try {
    // Connect to the database
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1); // Exit with code 1 indicating an error
  }

  console.log(`Server listening on port ${port}`);
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});
