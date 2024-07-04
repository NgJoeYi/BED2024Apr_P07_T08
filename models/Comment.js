const sql = require('mssql');
const dbConfig = require('../dbConfig');

async function getAllComments(connection) {
    // hi i change this 
    const query = `
    
        SELECT uc.id, uc.content, uc.created_at, uc.discussion_id, u.id AS user_id, u.name AS username,
               ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic 
        FROM user_comments uc
        JOIN Users u ON uc.user_id = u.id
        LEFT JOIN ProfilePic p ON u.id = p.user_id
    `;
    try {
        const result = await connection.query(query);
        return result.recordset;
    } catch (err) {
        throw new Error('Error fetching comments: ' + err.message);
    }
}

async function getCommentById(connection, id) {
    // hi i change this 
    const query = `
        SELECT uc.id, uc.content, uc.created_at, uc.discussion_id, uc.user_id, u.name AS username,
               ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic 
        FROM user_comments uc
        JOIN Users u ON uc.user_id = u.id
        LEFT JOIN ProfilePic p ON u.id = p.user_id
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

async function getCommentsByDiscussionId(connection, discussionId) {
    // hi i change this 
    const query = `
        SELECT uc.id, uc.content, uc.created_at, uc.discussion_id, u.id AS user_id, u.name AS username,
               ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic 
        FROM user_comments uc
        JOIN Users u ON uc.user_id = u.id
        LEFT JOIN ProfilePic p ON u.id = p.user_id
        WHERE uc.discussion_id = @discussionId
    `;
    try {
        const request = new sql.Request(connection);
        request.input('discussionId', sql.Int, discussionId);
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        throw new Error('Error fetching comments: ' + err.message);
    }
}


async function createComment(connection, content, userId, discussion_id) {
    const query = `
        INSERT INTO user_comments (content, user_id, discussion_id, created_at)
        VALUES (@content, @userId, @discussion_id, GETDATE())
    `;
    try {
        const request = new sql.Request(connection);
        request.input('content', sql.NVarChar, content);
        request.input('userId', sql.Int, userId);
        request.input('discussion_id', sql.Int, discussion_id);
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

async function deleteComment(connection, id) {
    const query = `
        DELETE FROM user_comments
        WHERE id = @id
    `;
    try {
        const request = new sql.Request(connection);
        request.input('id', sql.Int, id);
        const result = await request.query(query);
        return result.rowsAffected;
    } catch (err) {
        throw new Error('Error deleting comment: ' + err.message);
    }
}

function fetchCommentCountForDiscussion(discussionId) {
    fetch(`/comments/count?discussionId=${discussionId}`)
        .then(response => response.json())
        .then(data => {
            if (data.count !== undefined) {
                const commentCountElement = document.getElementById(`comment-count-${discussionId}`);
                commentCountElement.textContent = `Total Comments: ${data.count}`;
            } else {
                console.error('Error fetching comment count for discussion:', data);
                alert('Error fetching comment count.');
            }
        })
        .catch(error => {
            console.error('Network or server error:', error);
            alert('Error fetching comment count.');
        });
}


module.exports = {
    getAllComments,
    getCommentById,
    getCommentsByDiscussionId,
    createComment,
    updateComment,
    deleteComment,
    fetchCommentCountForDiscussion
    
};
