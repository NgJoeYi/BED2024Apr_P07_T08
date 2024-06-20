const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const path = require('path'); // Make sure to include this for setting views directory
const dbConfig = require('./dbConfig');
const userController = require('./controllers/userController');
const discussionController = require('./controllers/discussionController');
const commentController = require('./controllers/commentController');
const reviewController = require('./controllers/reviewController'); // Add this line

const app = express();
const port = process.env.PORT || 3000; // Use environment variable/default port

// Set up the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Add this line if not already present

// Serve static files from the public directory
app.use(express.static('public'));

// Include body-parser middleware to handle JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling

// Add Routes for users
app.post('/users/register', userController.createUser);
app.post('/users/login', userController.loginUser);
app.get('/account/:id', userController.getUserById);
app.put('/account/:id', userController.updateUser);

// Add Routes for discussions
app.get('/discussions', discussionController.getDiscussions);
app.post('/discussions', discussionController.createDiscussion);
app.get('/discussions/:id/edit', discussionController.getDiscussionById);
app.put('/discussions/:id', discussionController.updateDiscussion);
app.delete('/discussions/:id', discussionController.deleteDiscussion);

// Add Routes for comments
app.get('/comments', commentController.getComments);

// Add Routes for reviews
app.get('/reviews', reviewController.getReviews); // Updated to render reviews view

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
