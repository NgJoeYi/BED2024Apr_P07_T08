const sql = require('mssql');
const dbConfig = require('../dbConfig');
const commentModel = require('../models/Comment');

async function getComments(req, res) {
    const { discussionId } = req.query;
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        let comments;
        if (discussionId) {
            comments = await commentModel.getCommentsByDiscussionId(connection, discussionId);
        } else {
            comments = await commentModel.getAllComments(connection);
        }
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching comments");
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createComment(req, res) {
    const { content, discussionId } = req.body;
    const userId = req.user.id;
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await commentModel.createComment(connection, content, userId, discussionId);
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating comment");
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateComment(req, res) {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    console.log('Received User ID:', userId); // Debug log
    console.log('Content:', content); // Debug log
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const comment = await commentModel.getCommentById(connection, id);
        console.log('Comment User ID:', comment.user_id); // Debug log
        if (parseInt(comment.user_id, 10) !== parseInt(userId, 10)) {
            console.log('User ID mismatch:', parseInt(comment.user_id, 10), parseInt(userId, 10)); // Debug log
            return res.status(403).send('You can only edit your own comments.');
        }
        const updatedComment = await commentModel.updateComment(connection, id, content);
        res.json(updatedComment);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating comment");
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteComment(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const comment = await commentModel.getCommentById(connection, id);
        if (parseInt(comment.user_id, 10) !== parseInt(userId, 10)) {
            return res.status(403).send('You can only delete your own comments.');
        }
        const deletedComment = await commentModel.deleteComment(connection, id);
        res.json(deletedComment);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting comment");
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    getComments,
    createComment,
    updateComment,
    deleteComment,
};
