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

    console.log(`Received request to update review with ID: ${id}`);
    console.log(`Review text: ${review_text}, Rating: ${rating}, User ID: ${userId}`);

    try {
        connection = await sql.connect(dbConfig);
        const review = await reviewModel.getReviewById(id);
        
        if (!review) {
            console.error('Review not found');
            return res.status(404).json({ error: 'Review not found' });
        }
        
        if (parseInt(review.user_id, 10) !== parseInt(userId, 10)) {
            console.error('User not authorized to update this review');
            return res.status(403).send('You can only edit your own reviews.');
        }

        console.log('Review found:', review);
        
        await reviewModel.updateReview(connection, id, review_text, rating);

        console.log('Review updated successfully');
        res.status(200).json({ message: 'Review updated successfully' });
    } catch (err) {
        console.error('Error updating review:', err.message);
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

    console.log(`Received request to delete review with ID: ${id}`);

    try {
        connection = await sql.connect(dbConfig);
        const review = await reviewModel.getReviewById(id);
        
        if (!review) {
            console.error('Review not found');
            return res.status(404).json({ error: 'Review not found' });
        }
        
        if (parseInt(review.user_id, 10) !== parseInt(userId, 10)) {
            console.error('User not authorized to delete this review');
            return res.status(403).send('You can only delete your own reviews.');
        }

        console.log('Review found:', review);
        
        await reviewModel.deleteReview(connection, id);

        console.log('Review deleted successfully');
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error('Error deleting review:', err.message);
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
