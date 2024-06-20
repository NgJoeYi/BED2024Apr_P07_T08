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

async function getReviewById(reviewId) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id', sql.Int, reviewId)
            .query(`
                SELECT ur.review_id, ur.review_text, ur.rating, ur.review_date, u.name AS user_name
                FROM user_reviews ur
                JOIN Users u ON ur.user_id = u.id
                WHERE ur.review_id = @id
            `);
        return result.recordset[0];
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = {
    getAllReviews,
    getReviewById
};