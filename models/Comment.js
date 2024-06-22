const sql = require('mssql');
const dbConfig = require('../dbConfig');

async function getAllComments(connection) {
    const query = `
        SELECT uc.id, uc.content, uc.created_at, uc.parent_comment_id, u.id AS user_id, u.name AS username 
        FROM user_comments uc
        JOIN Users u ON uc.user_id = u.id
    `;
    try {
        const result = await connection.query(query);
        return result.recordset;
    } catch (err) {
        throw new Error('Error fetching comments: ' + err.message);
    }
}

async function getCommentById(connection, id) {
    const query = `
        SELECT uc.id, uc.content, uc.created_at, uc.parent_comment_id, uc.user_id, u.name AS username 
        FROM user_comments uc
        JOIN Users u ON uc.user_id = u.id
        WHERE uc.id = @id
    `;
    try {
        const request = new sql.Request(connection);
        request.input('id', sql.Int, id);
        const result = await request.query(query);
        return result.recordset[0];
    } catch (err) {
        throw new Error('Error fetching comment: ' + err.message);
    }
}

async function createComment(connection, content, userId, parent_comment_id) {
    const query = `
        INSERT INTO user_comments (content, user_id, parent_comment_id, created_at)
        VALUES (@content, @userId, @parent_comment_id, GETDATE())
    `;
    try {
        const request = new sql.Request(connection);
        request.input('content', sql.NVarChar, content);
        request.input('userId', sql.Int, userId);
        request.input('parent_comment_id', sql.Int, parent_comment_id);
        const result = await request.query(query);
        return result.rowsAffected;
    } catch (err) {
        throw new Error('Error creating comment: ' + err.message);
    }
}

async function updateComment(connection, id, content) {
    const query = `
        UPDATE user_comments
        SET content = @content
        WHERE id = @id
    `;
    try {
        const request = new sql.Request(connection);
        request.input('id', sql.Int, id);
        request.input('content', sql.NVarChar, content);
        const result = await request.query(query);
        return result.rowsAffected;
    } catch (err) {
        throw new Error('Error updating comment: ' + err.message);
    }
}

module.exports = {
    getAllComments,
    getCommentById,
    createComment,
    updateComment
};
