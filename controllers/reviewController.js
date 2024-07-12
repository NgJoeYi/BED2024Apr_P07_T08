const sql = require('mssql');
const dbConfig = require('../dbConfig');
const reviewModel = require('../models/Review');

async function getReviews(req, res) {
    const { courseId, filter = 'all', sort = 'mostRecent' } = req.query;
    try {
        const reviews = await reviewModel.getAllReviews(courseId, filter, sort);
        res.status(200).json(reviews);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message });
    }
}

async function updateReview(req, res) {
    const { id } = req.params;
    const { review_text, rating } = req.body;
    const userId = req.user.id;
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
    const { review_text, rating, courseId } = req.body;
    const userId = req.user.id;

    if (!courseId || isNaN(courseId)) {
        return res.status(400).json({ error: 'Course ID is required and must be a valid number' });
    }

    if (!review_text || !rating || !userId) {
        return res.status(400).json({ error: 'Review text, rating, and user ID are required' });
    }

    console.log(`Creating review: userId=${userId}, review_text=${review_text}, rating=${rating}, courseId=${courseId}`);

    try {
        await reviewModel.createReview(userId, review_text, rating, parseInt(courseId, 10));
        res.status(201).json({ message: 'Review created successfully' });
    } catch (err) {
        console.error('Error creating review:', err); // Detailed error logging
        res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
    }
}


async function deleteReview(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
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

async function getReviewCount(req, res) {
    const { courseId } = req.query;
    try {
        const count = await reviewModel.getReviewCount(courseId);
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching review count");
    }
}



module.exports = {
    getReviews,
    updateReview,
    createReview,
    deleteReview,
    getReviewCount,
};
