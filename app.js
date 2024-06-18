const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");
const dbConfig = require("./dbConfig");
const userController = require('./controllers/userController');
const discussionController = require('./controllers/discussionController');
// const methodOverride = require('method-override');

const app = express();
const port = process.env.PORT || 3000; // Use environment variable/default port

// Set up the view engine
app.set('view engine', 'ejs');

// Serve static files from the public directory
app.use(express.static('public'));

// Include body-parser middleware to handle JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling

// // Override with POST having ?_method=DELETE or ?_method=PUT
// app.use(methodOverride('_method'));

// Add Routes for users
app.post('/users/register', userController.createUser);
app.post('/users/login', userController.loginUser);

// Add Routes for discussions
app.get('/discussions', discussionController.getDiscussions);
app.post('/discussions', discussionController.createDiscussion);
app.get('/discussions/:id/edit', discussionController.getDiscussionById);
app.put('/discussions/:id', discussionController.updateDiscussion);
app.delete('/discussions/:id', discussionController.deleteDiscussion);

app.listen(port, async () => {
  try {
    // Connect to the database
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    // Terminate the application with an error code (optional)
    process.exit(1); // Exit with code 1 indicating an error
  }

  console.log(`Server listening on port ${port}`);
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});
