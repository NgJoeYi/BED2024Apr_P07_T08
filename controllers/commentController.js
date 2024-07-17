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
    console.log('Creating comment:', { content, discussionId, userId }); // Log the request data
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await commentModel.createComment(connection, content, userId, discussionId);
        res.status(201).json(result);
    } catch (err) {
        console.error('Error creating comment:', err.message);
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
    const userId = req.user.id; // -- jwt implementation
    console.log('Received User ID:', userId); // Debug log
    console.log('Content:', content); // Debug log
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const comment = await commentModel.getCommentById(connection, id);
        console.log('Comment User ID:', comment.user_id); // Debug log

        // ******** DONT NEED DO THIS BC TO CHECK USERID IS ALREADY DONE USING verifyJWT MIDDLEWARE ******
        // if (parseInt(comment.user_id, 10) !== parseInt(userId, 10)) {
        //     console.log('User ID mismatch:', parseInt(comment.user_id, 10), parseInt(userId, 10)); // Debug log
        //     return res.status(403).send('You can only edit your own comments.');
        // }

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
    const userId = req.user.id; // -- jwt implementation
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const comment = await commentModel.getCommentById(connection, id);

        // ******** DONT NEED DO THIS BC TO CHECK USERID IS ALREADY DONE USING verifyJWT MIDDLEWARE ******
        // if (parseInt(comment.user_id, 10) !== parseInt(userId, 10)) {
        //     return res.status(403).send('You can only delete your own comments.');
        // }

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

async function getCommentCount(req, res) {
    const { discussionId } = req.query;
    try {
        const count = await commentModel.getCommentCount(discussionId);
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching comment count");
    }
}

async function getCommentCountByDiscussionId(req, res) {
    const { discussionId } = req.params;
    try {
        const count = await commentModel.getCommentCountByDiscussionId(discussionId);
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching comment count by discussion ID");
    }
}


module.exports = {
    getComments,
    createComment,
    updateComment,
    deleteComment,
    getCommentCount,
    getCommentCountByDiscussionId,
};
