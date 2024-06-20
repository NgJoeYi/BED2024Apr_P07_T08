const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const path = require('path');
const dbConfig = require('./dbConfig');
const userController = require('./controllers/userController');
const discussionController = require('./controllers/discussionController');
const commentController = require('./controllers/commentController');
const reviewController = require('./controllers/reviewController');

const app = express();
const port = process.env.PORT || 3000;

// Set up the view engine
app.set('view engine', 'ejs');

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Include body-parser middleware to handle JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
app.get('/reviews', reviewController.getReviews);

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
