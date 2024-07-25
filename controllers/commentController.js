const sql = require('mssql'); // Importing the 'mssql' library for SQL Server operations
// const dbConfig = require('../dbConfig'); // Importing database configuration
const commentModel = require('../models/Comment'); // Importing the Comment model


const getComments = async (req, res) => {
    const { discussionId } = req.query; // Extract discussionId from query parameters
    try {
        let comments;
        // Check if discussionId is provided
        if (discussionId) {
            comments = await commentModel.getCommentsByDiscussionId(discussionId); // Fetch comments for the specific discussion ID if discussion Id exists
        } else {
            comments = await commentModel.getAllComments(); 
        }
        res.json(comments); // Send the comments as a JSON response
    } catch (err) {
        console.error(err); // Log the error
        res.status(500).send("Error fetching comments"); // Send 500 status code if an error occurs
    } 
}

const createComment = async (req, res) => {
    const { content, discussionId } = req.body;  // Extract content and discussionId from request body
    const userId = req.user.id; // Extract user ID from authenticated user
    try {
        // Create a new comment in the database
        const result = await commentModel.createComment(content, userId, discussionId);
        // Send the created comment as JSON response with 201 status
        res.status(201).json(result);
    } catch (err) {
        console.error('Error creating comment:', err.message);
        res.status(500).send("Error creating comment"); // Send 500 status code if an error occurs
    } 
}

const updateComment = async (req, res) => {
    const { id } = req.params;  // Extract the comment ID from request parameters
    const { content } = req.body; // Extract content from request body
    const userId = req.user.id; // Extract user ID from authenticated user
    try {
        const comment = await commentModel.getCommentById(id); // Fetch existing comment by ID

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' }); // Return 404 if comment not found
        }

        // Update the comment content in the database
        const updatedComment = await commentModel.updateComment(id, content);
        res.json(updatedComment); // Send the updated comment as JSON response
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating comment"); // Send 500 status code if an error occurs
    }
}

const deleteComment = async (req, res) => {
    const { id } = req.params; // Extract comment ID from request params
    const userId = req.user.id; // Extract user ID from authenticated user
    try {
        const comment = await commentModel.getCommentById(id); // Fetch the existing comment by ID

        if (!comment) {
            console.error('Comment not found');
            return res.status(404).json({ error: 'Comment not found' }); // Return 404 if comment not found
        }

        // Delete the comment from the database
        const deletedComment = await commentModel.deleteComment(id);
        res.json(deletedComment); // Send confirmation as JSON response

    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting comment"); // Send 500 status code if an error occurs
    } 
}

const getCommentCount = async (req, res) => {
    try {
        const count = await commentModel.getCommentCount(); // Fetch the total count of comments from the database
        res.json({ count }); // Send count as JSON response
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching comment count"); // Send 500 status code if an error occurs
    }
}

const getCommentCountByDiscussionId = async (req, res) => {
    const { discussionId } = req.params; // Extract discussion ID from request parameters
    try {
        // Fetch the count of comments for the specific discussion
        const count = await commentModel.getCommentCountByDiscussionId(discussionId);
        res.json({ count }); // Send the count as JSON response
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching comment count by discussion ID"); // Send 500 status code if an error occurs
    }
}

const incrementLikes = async (req, res) => {
    try {
        const commentId = req.params.commentId; // Get comment ID from request parameters
        const likes = await commentModel.incrementLikes(commentId); // Increment likes for comment in the database
        res.json({ success: true, likes }); // Send the new like count as JSON response
    } catch (err) {
        console.error('Error incrementing likes:', err);
        res.status(500).json({ success: false, error: err.message }); // Send 500 status code if an error occurs
    }
}

const incrementDislikes = async (req, res) => {
    try {
        const commentId = req.params.commentId; // Get comment ID from request parameters
        const dislikes = await commentModel.incrementDislikes(commentId); // Increment dislikes for comment in the database
        res.json({ success: true, dislikes }); // Send the new dislike count as JSON response
    } catch (err) {
        console.error('Error incrementing dislikes:', err);
        res.status(500).json({ success: false, error: err.message }); // Send 500 status code if an error occurs
    }
}

module.exports = {
    getComments,
    createComment,
    updateComment,
    deleteComment,
    getCommentCount,
    getCommentCountByDiscussionId,
    incrementLikes,
    incrementDislikes,
};
