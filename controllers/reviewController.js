const sql = require('mssql');
const dbConfig = require('../dbConfig');
const reviewModel = require('../models/Review');

async function getReviews(req, res) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const reviews = await reviewModel.getAllReviews(connection);
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

module.exports = {
    getReviews,
    updateReview,
    createReview,
};
