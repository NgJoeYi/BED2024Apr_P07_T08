const sql = require('mssql');
const dbConfig = require('../dbConfig');
const commentModel = require('../models/Comment');

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

const createComment = async (req, res) => {
    const { content, discussionId } = req.body;
    const userId = req.user.id;
    try {
        const result = await commentModel.createComment(content, userId, discussionId);
        res.status(201).json(result);
    } catch (err) {
        console.error('Error creating comment:', err.message);
        res.status(500).send("Error creating comment");
    } 
}

const updateComment = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    try {
        const comment = await commentModel.getCommentById(id);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // ******** DONT NEED DO THIS BC TO CHECK USERID IS ALREADY DONE USING verifyJWT MIDDLEWARE ******
        // if (parseInt(comment.user_id, 10) !== parseInt(userId, 10)) {
        //     console.log('User ID mismatch:', parseInt(comment.user_id, 10), parseInt(userId, 10)); // Debug log
        //     return res.status(403).send('You can only edit your own comments.');
        // }

        const updatedComment = await commentModel.updateComment(id, content);
        res.json(updatedComment);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating comment");
    }
}

const deleteComment = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const comment = await commentModel.getCommentById(id);

        if (!comment) {
            console.error('Comment not found');
            return res.status(404).json({ error: 'Comment not found' });
        }

        // ******** DONT NEED DO THIS BC TO CHECK USERID IS ALREADY DONE USING verifyJWT MIDDLEWARE ******
        // if (parseInt(comment.user_id, 10) !== parseInt(userId, 10)) {
        //     return res.status(403).send('You can only delete your own comments.');
        // }

        const deletedComment = await commentModel.deleteComment(id);
        res.json(deletedComment);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting comment");
    } 
}

const getCommentCount = async (req, res) => {
    try {
        const count = await commentModel.getCommentCount();
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching comment count");
    }
}

const getCommentCountByDiscussionId = async (req, res) => {
    const { discussionId } = req.params;
    try {
        const count = await commentModel.getCommentCountByDiscussionId(discussionId);
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching comment count by discussion ID");
    }
}

const incrementLikes = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const likes = await commentModel.incrementLikes(commentId);
        res.json({ success: true, likes });
    } catch (err) {
        console.error('Error incrementing likes:', err);
        res.status(500).json({ success: false, error: err.message });
    }
}

const incrementDislikes = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const dislikes = await commentModel.incrementDislikes(commentId);
        res.json({ success: true, dislikes });
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
