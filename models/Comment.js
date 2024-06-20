const sql = require('mssql');

async function getAllComments() {
    const query = `
        SELECT mc.id, mc.content, mc.created_at, mc.parent_comment_id, u.name AS username 
        FROM member_comments mc
        JOIN Users u ON mc.user_id = u.id
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
