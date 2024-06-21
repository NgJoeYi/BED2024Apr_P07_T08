const sql = require('mssql');

async function getAllComments() {
    const query = `
        SELECT uc.id, uc.content, uc.created_at, uc.parent_comment_id, u.name AS username 
        FROM user_comments uc
        JOIN Users u ON uc.user_id = u.id
    `;
    try {
        const result = await sql.query(query);
        return result.recordset;
    } catch (err) {
        throw new Error('Error fetching comments: ' + err.message);
    }
}

async function updateComment(id, content) {
    const query = `
        UPDATE user_comments
        SET content = @content
        WHERE id = @id
    `;
    try {
        const request = new sql.Request();
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
    updateComment  
};
