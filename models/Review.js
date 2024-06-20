const sql = require('mssql');
const dbConfig = require('../dbConfig');

async function getAllReviews() {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
            SELECT ur.review_id, ur.review_text, ur.rating, ur.review_date, u.name AS user_name
            FROM user_reviews ur
            JOIN Users u ON ur.user_id = u.id
        `);
        return result.recordset;
    } catch (err) {
        throw new Error(err);
    }
}

async function updateReview(id, review_text, rating) {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('review_id', sql.Int, id)
            .input('review_text', sql.NVarChar, review_text)
            .input('rating', sql.Int, rating)
            .query(`
                UPDATE user_reviews
                SET review_text = @review_text, rating = @rating
                WHERE review_id = @review_id
            `);
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = {
    getAllReviews,
    updateReview, 
};
