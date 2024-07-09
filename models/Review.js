const sql = require('mssql');
const dbConfig = require('../dbConfig');


async function getAllReviews(connection, courseId, filter = 'all', sort = 'mostRecent') {
    try {
        let query = `
            SELECT ur.review_id, ur.review_text, ur.rating, ur.review_date, ur.user_id, u.name AS user_name, ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic
            FROM user_reviews ur
            JOIN Users u ON ur.user_id = u.id
            LEFT JOIN ProfilePic p ON u.id = p.user_id
            WHERE ur.course_id = @course_id
        `;

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

        const request = connection.request()
            .input('course_id', sql.Int, courseId);

        if (filter !== 'all') {
            request.input('filter', sql.Int, filter);
        }

        const result = await request.query(query);
        console.log('Query Result:', result); // Add this line to log the result
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
                SELECT ur.review_id, ur.review_text, ur.rating, ur.review_date, ur.user_id, u.name AS user_name, ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic
                FROM user_reviews ur
                JOIN Users u ON ur.user_id = u.id
                LEFT JOIN ProfilePic p ON u.id = p.user_id
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

function fetchReviewCountForCourse(courseId) {
    fetch(`/reviews/count?courseId=${courseId}`)
        .then(response => response.json())
        .then(data => {
            if (data.count !== undefined) {
                const reviewCountElement = document.getElementById(`review-count-${courseId}`);
                reviewCountElement.textContent = `Total Reviews: ${data.count}`;
            } else {
                console.error('Error fetching review count for course:', data);
                alert('Error fetching review count.');
            }
        })
        .catch(error => {
            console.error('Network or server error:', error);
            alert('Error fetching review count.');
        });
}


module.exports = {
    getAllReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
    fetchReviewCountForCourse
};
