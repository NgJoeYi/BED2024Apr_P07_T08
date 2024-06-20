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

module.exports = {
    getAllComments
};

