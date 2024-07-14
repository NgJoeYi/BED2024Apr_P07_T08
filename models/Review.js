const sql = require('mssql');
const dbConfig = require('../dbConfig');


async function getAllReviews(courseId, filter = 'all', sort = 'mostRecent') {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        
        let query = `
            SELECT ur.review_id, ur.review_text, ur.rating, ur.review_date, ur.user_id, u.name AS user_name, ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role
            FROM user_reviews ur
            JOIN Users u ON ur.user_id = u.id
            LEFT JOIN ProfilePic p ON u.id = p.user_id
        `;
        
        // Add WHERE clause if courseId is provided
        if (courseId && !isNaN(courseId)) {
            query += ` WHERE ur.course_id = @course_id `;
        } else {
            query += ` WHERE 1=1 `;
        }
        
        if (filter !== 'all') {
            query += ` AND ur.rating = @filter `;
        }
        
        if (sort === 'highestRating') {
            query += ` ORDER BY ur.rating DESC `;
        } else if (sort === 'lowestRating') {
            query += ` ORDER BY ur.rating ASC `;
        } else {
            query += ` ORDER BY ur.review_date DESC `;
        }
        
        const request = connection.request();
        
        if (courseId && !isNaN(courseId)) {
            request.input('course_id', sql.Int, parseInt(courseId, 10));
        }
        
        if (filter !== 'all') {
            request.input('filter', sql.Int, filter);
        }
        
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        console.error('Error fetching reviews:', err.message);
        throw new Error('Error fetching reviews');
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function getReviewById(id) {
    try {
        const connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input('review_id', sql.Int, id)
            .query(`
                SELECT ur.review_id, ur.review_text, ur.rating, ur.review_date, ur.user_id, u.name AS user_name, ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role
                FROM user_reviews ur
                JOIN Users u ON ur.user_id = u.id
                LEFT JOIN ProfilePic p ON u.id = p.user_id
                WHERE ur.review_id = @review_id
            `);
        return result.recordset[0];
    } catch (err) {
        console.error('Error fetching review:', err.message);
        throw new Error('Error fetching review');
    }
}

async function updateReview(id, review_text, rating, courseId) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('review_id', sql.Int, id) // Correctly declare the variable here
            .input('review_text', sql.NVarChar, review_text)
            .input('rating', sql.Int, rating)
            .input('course_id', sql.Int, courseId)
            .query(`
                UPDATE user_reviews
                SET review_text = @review_text, rating = @rating, course_id = @course_id
                WHERE review_id = @review_id
            `);

        if (result.rowsAffected[0] === 0) {
            throw new Error('Review not found or no changes made');
        }

        return result;
    } catch (err) {
        console.error('SQL error:', err.message);
        throw err;
    }
}

async function createReview(userId, review_text, rating, courseId) {
    let pool;
    try {
        pool = await sql.connect(dbConfig);
        console.log(`Executing query to create review with userId: ${userId}, review_text: ${review_text}, rating: ${rating}, courseId: ${courseId}`);
        await pool.request()
            .input('user_id', sql.Int, userId)
            .input('review_text', sql.NVarChar, review_text)
            .input('rating', sql.Int, rating)
            .input('course_id', sql.Int, courseId)
            .query(`
                INSERT INTO user_reviews (user_id, review_text, rating, review_date, course_id)
                VALUES (@user_id, @review_text, @rating, GETDATE(), @course_id)
            `);
    } catch (err) {
        console.error('SQL Error:', err); // Detailed SQL error logging
        throw new Error('Error creating review: ' + err.message);
    } finally {
        if (pool) {
            pool.close();
        }
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
        console.log('Review deleted successfully for ID:', id);
    } catch (err) {
        console.error('Error executing delete query:', err.message);
        throw new Error('Error deleting review: ' + err.message);
    }
}


async function getReviewCount(courseId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        let countQuery = `SELECT COUNT(*) AS count FROM user_reviews`;
        if (courseId) {
            countQuery += ` WHERE course_id = @courseId`;
        }
        const request = new sql.Request(connection);
        if (courseId) {
            request.input('courseId', sql.Int, courseId);
        }
        const result = await request.query(countQuery);
        return result.recordset[0].count;
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching review count');
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}


module.exports = {
    getAllReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
    getReviewCount
};
