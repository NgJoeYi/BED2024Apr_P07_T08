const sql = require('mssql');
const dbConfig = require('../dbConfig');
const reviewModel = require('../models/Review');

async function getReviews(req, res) {
    const { courseId } = req.query;
    if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required' });
    }
    
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const reviews = await reviewModel.getAllReviews(connection, courseId);
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}


async function updateReview(req, res) {
    const { id } = req.params;
    const { review_text, rating, userId } = req.body;
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const review = await reviewModel.getReviewById(connection, id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (parseInt(review.user_id, 10) !== parseInt(userId, 10)) {
            return res.status(403).send('You can only edit your own reviews.');
        }
        await reviewModel.updateReview(connection, id, review_text, rating);
        res.status(200).json({ message: 'Review updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createReview(req, res) {
    const { review_text, rating, userId } = req.body;
    try {
        await reviewModel.createReview(userId, review_text, rating);
        res.status(201).json({ message: 'Review created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteReview(req, res) {
    const { id } = req.params;
    const { userId } = req.body;
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const review = await reviewModel.getReviewById(connection, id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (parseInt(review.user_id, 10) !== parseInt(userId, 10)) {
            return res.status(403).send('You can only delete your own reviews.');
        }
        await reviewModel.deleteReview(connection, id);
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    getReviews,
    updateReview,
    createReview,
    deleteReview,
};
