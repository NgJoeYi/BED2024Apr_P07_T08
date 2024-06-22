const sql = require('mssql');
const dbConfig = require('../dbConfig');

async function getAllReviews(connection) {
    try {
        const result = await connection.request().query(`
            SELECT ur.review_id, ur.review_text, ur.rating, ur.review_date, ur.user_id, u.name AS user_name
            FROM user_reviews ur
            JOIN Users u ON ur.user_id = u.id
        `);
        return result.recordset;
    } catch (err) {
        throw new Error('Error fetching reviews: ' + err.message);
    }
}

async function getReviewById(connection, id) {
    try {
        const result = await connection.request()
            .input('review_id', sql.Int, id)
            .query(`
                SELECT ur.review_id, ur.review_text, ur.rating, ur.review_date, ur.user_id, u.name AS user_name
                FROM user_reviews ur
                JOIN Users u ON ur.user_id = u.id
                WHERE ur.review_id = @review_id
            `);
        return result.recordset[0];
    } catch (err) {
        throw new Error('Error fetching review: ' + err.message);
    }
}

async function updateReview(connection, id, review_text, rating) {
    try {
        await connection.request()
            .input('review_id', sql.Int, id)
            .input('review_text', sql.NVarChar, review_text)
            .input('rating', sql.Int, rating)
            .query(`
                UPDATE user_reviews
                SET review_text = @review_text, rating = @rating
                WHERE review_id = @review_id
            `);
    } catch (err) {
        throw new Error('Error updating review: ' + err.message);
    }
}

async function createReview(userId, review_text, rating) {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('user_id', sql.Int, userId)
            .input('review_text', sql.NVarChar, review_text)
            .input('rating', sql.Int, rating)
            .query(`
                INSERT INTO user_reviews (user_id, review_text, rating, review_date)
                VALUES (@user_id, @review_text, @rating, GETDATE())
            `);
    } catch (err) {
        throw new Error('Error creating review: ' + err.message);
    }
}

async function deleteReview(connection, id) {
    try {
        await connection.request()
            .input('review_id', sql.Int, id)
            .query(`
                DELETE FROM user_reviews
                WHERE review_id = @review_id
            `);
    } catch (err) {
        throw new Error('Error deleting review: ' + err.message);
    }
}

module.exports = {
    getAllReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
};
