const sql = require('mssql');
const dbConfig = require('../dbConfig');
const commentModel = require('../models/Comment'); // Importing the Comment model


/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments or comments by discussion ID
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: discussionId
 *         schema:
 *           type: integer
 *         description: ID of the discussion to fetch comments for
 *     responses:
 *       200:
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Error fetching comments
 */
const getComments = async (req, res) => {
    const { discussionId } = req.query;
    try {
        let comments;
        if (discussionId) {
            comments = await commentModel.getCommentsByDiscussionId(discussionId);
        } else {
            comments = await commentModel.getAllComments();
        }
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching comments");
    } 
}

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               discussionId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       500:
 *         description: Error creating comment
 */
const createComment = async (req, res) => {
    const { content, discussionId } = req.body;  // Get content and discussionId from request body
    const userId = req.user.id; // Get user ID from authenticated user
    try {
        // Create a new comment in the database
        const result = await commentModel.createComment(content, userId, discussionId);
        // Send the created comment as JSON response with 201 status
        res.status(201).json(result);
    } catch (err) {
        console.error('Error creating comment:', err.message);
        res.status(500).send("Error creating comment");
    } 
}

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the comment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Error updating comment
 */
const updateComment = async (req, res) => {
    const { id } = req.params;  // Get the comment ID from request parameters
    const { content } = req.body; // Get content from request body
    const userId = req.user.id; // Get user ID from authenticated user
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
        res.status(500).send("Error updating comment");
    }
}

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Error deleting comment
 */
const deleteComment = async (req, res) => {
    const { id } = req.params; // Get comment ID from request params
    const userId = req.user.id; // Get user ID from authenticated user
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
        res.status(500).send("Error deleting comment");
    } 
}

/**
 * @swagger
 * /comments/count:
 *   get:
 *     summary: Get the total count of comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: Total count of comments
 *       500:
 *         description: Error fetching comment count
 */
const getCommentCount = async (req, res) => {
    try {
        const count = await commentModel.getCommentCount(); // Fetch the total count of comments from the database
        res.json({ count }); // Send count as JSON response
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching comment count");
    }
}

/**
 * @swagger
 * /comments/discussion/{discussionId}/count:
 *   get:
 *     summary: Get the count of comments for a specific discussion
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: discussionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the discussion
 *     responses:
 *       200:
 *         description: Count of comments for the discussion
 *       500:
 *         description: Error fetching comment count by discussion ID
 */
const getCommentCountByDiscussionId = async (req, res) => {
    const { discussionId } = req.params; // Get discussion ID from request parameters
    try {
        // Fetch the count of comments for the specific discussion
        const count = await commentModel.getCommentCountByDiscussionId(discussionId);
        res.json({ count }); // Send the count as JSON response
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching comment count by discussion ID");
    }
}

/**
 * @swagger
 * /comments/{commentId}/like:
 *   post:
 *     summary: Increment likes for a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the comment to like
 *     responses:
 *       200:
 *         description: Likes incremented successfully
 *       500:
 *         description: Error incrementing likes
 */
const incrementLikes = async (req, res) => {
    try {
        const commentId = req.params.commentId; // Get comment ID from request parameters
        const likes = await commentModel.incrementLikes(commentId); // Increment likes for comment in the database
        res.json({ success: true, likes }); // Send the new like count as JSON response
    } catch (err) {
        console.error('Error incrementing likes:', err);
        res.status(500).json({ success: false, error: err.message });
    }
}

/**
 * @swagger
 * /comments/{commentId}/dislike:
 *   post:
 *     summary: Increment dislikes for a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the comment to dislike
 *     responses:
 *       200:
 *         description: Dislikes incremented successfully
 *       500:
 *         description: Error incrementing dislikes
 */
const incrementDislikes = async (req, res) => {
    try {
        const commentId = req.params.commentId; // Get comment ID from request parameters
        const dislikes = await commentModel.incrementDislikes(commentId); // Increment dislikes for comment in the database
        res.json({ success: true, dislikes }); // Send the new dislike count as JSON response
    } catch (err) {
        console.error('Error incrementing dislikes:', err);
        res.status(500).json({ success: false, error: err.message });
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
