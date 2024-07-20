const sql = require('mssql');
const dbConfig = require('../dbConfig');
const reviewModel = require('../models/Review');

const getReviews = async (req, res) => {
    const { courseId, filter = 'all', sort = 'mostRecent' } = req.query;
    try {
        const reviews = await reviewModel.getAllReviews(courseId, filter, sort);
        res.status(200).json(reviews);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message });
    }
}

const createReview = async (req, res) => {
    const { review_text, rating, courseId } = req.body;
    const userId = req.user.id;

    console.log(`Creating review: userId=${userId}, review_text=${review_text}, rating=${rating}, courseId=${courseId}`);

    try {
        await reviewModel.createReview(userId, review_text, rating, courseId);
        res.status(201).json({ message: 'Review created successfully' });
    } catch (err) {
        console.error('Error creating review:', err.message);
        res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
    }
}

const updateReview = async (req, res) => {
    const { id } = req.params;
    const { review_text, rating, courseId } = req.body;
    const userId = req.user.id;

    console.log(`Updating review: id=${id}, userId=${userId}, review_text=${review_text}, rating=${rating}, courseId=${courseId}`);

    try {
        const review = await reviewModel.getReviewById(id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // ******** DONT NEED DO THIS BC TO CHECK USERID IS ALREADY DONE USING verifyJWT MIDDLEWARE ******
        // if (review.user_id !== userId) {
        //     return res.status(403).json({ error: 'You can only edit your own reviews.' });
        // } 

        await reviewModel.updateReview(id, review_text, rating, courseId);
        res.status(200).json({ message: 'Review updated successfully' });
    } catch (err) {
        console.error('Error updating review:', err.message);
        res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
    }
}

const deleteReview = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`Received request to delete review with ID: ${id}`);

    try {
        const review = await reviewModel.getReviewById(id);
        
        if (!review) {
            console.error('Review not found');
            return res.status(404).json({ error: 'Review not found' });
        }
        
        // ******** DONT NEED DO THIS BC TO CHECK USERID IS ALREADY DONE USING verifyJWT MIDDLEWARE ******
        // if (parseInt(review.user_id, 10) !== parseInt(userId, 10)) {
        //     console.error('User not authorized to delete this review');
        //     return res.status(403).send('You can only delete your own reviews.');
        // }

        console.log('Review found:', review);
        
        await reviewModel.deleteReview(id);

        console.log('Review deleted successfully');
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error('Error deleting review:', err.message);
        res.status(500).json({ error: err.message });
    }
}

const getReviewCount = async (req, res) => {
    const { courseId } = req.query;
    try {
        const count = await reviewModel.getReviewCount(courseId);
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching review count");
    }
}

const getReviewCountByCourseId= async (req, res) => {
    const { courseId } = req.params;
    try {
        const count = await reviewModel.getReviewCountByCourseId(courseId);
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching review count by course ID");
    }
}

const getReviewCountByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const count = await reviewModel.getReviewCountByUserId(userId);
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching review count by user ID");
    }
}


const getReviewsByRating = async (req, res) => {
    const { rating } = req.params;
    try {
        const reviews = await reviewModel.getAllReviews(null, rating);
        res.status(200).json(reviews);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message });
    }
}

const getReviewsSortedByRating = async (req, res) => {
    const { sort } = req.params;
    try {
        const reviews = await reviewModel.getAllReviews(null, 'all', sort);
        res.status(200).json(reviews);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message });
    }
}

const getReviewsByCourseId = async (req, res) => {
    const { courseId } = req.params;
    try {
        const reviews = await reviewModel.getAllReviews(courseId);
        res.status(200).json(reviews);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message });
    }
}

const getReviewsByCourseIdAndRating = async (req, res) => {
    const { courseId, rating } = req.params;
    try {
        const reviews = await reviewModel.getAllReviews(courseId, rating);
        res.status(200).json(reviews);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message });
    }
}

const getReviewsByCourseIdAndSort = async (req, res) => {
    const { courseId, sort } = req.params;
    try {
        const reviews = await reviewModel.getAllReviews(courseId, 'all', sort);
        res.status(200).json(reviews);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message });
    }
}

const incrementLikes = async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const likes = await reviewModel.incrementLikes(reviewId);
        res.json({ success: true, likes });
    } catch (err) {
        console.error('Error incrementing likes:', err);
        res.status(500).json({ success: false, error: err.message });
    }
}

const incrementDislikes = async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const dislikes = await reviewModel.incrementDislikes(reviewId);
        res.json({ success: true, dislikes });
    } catch (err) {
        console.error('Error incrementing dislikes:', err);
        res.status(500).json({ success: false, error: err.message });
    }
}


module.exports = {
    getReviews,
    updateReview,
    createReview,
    deleteReview,
    getReviewCount,
    getReviewCountByCourseId,
    getReviewCountByUserId,
    getReviewsByRating,
    getReviewsSortedByRating,
    getReviewsByCourseId,
    getReviewsByCourseIdAndRating,
    getReviewsByCourseIdAndSort,
    incrementLikes,
    incrementDislikes,
};
