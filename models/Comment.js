const sql = require('mssql');

async function getAllComments() {
    const query = `
        SELECT mc.id, mc.content, mc.created_at, mc.parent_comment_id, m.username 
        FROM member_comments mc
        JOIN members m ON mc.member_id = m.id
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
