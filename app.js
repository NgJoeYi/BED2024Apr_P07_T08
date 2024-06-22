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

// Serve the HTML page
app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'account.html'));
});

// Add Routes for users
app.post('/users/register', userController.createUser);
app.post('/users/login', userController.loginUser);
app.get('/account/:id', userController.getUserById);
app.put('/account/:id', userController.updateUser);

// Add Routes for discussions
app.get('/discussions', discussionController.getDiscussions);
app.post('/discussions', discussionController.createDiscussion);

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
