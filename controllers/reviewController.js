const reviewModel = require('../models/Review');

async function getReviews(req, res) {
    try {
        const reviews = await reviewModel.getAllReviews();
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getReviewById(req, res) {
    try {
        const reviewId = parseInt(req.params.id, 10);
        const review = await reviewModel.getReviewById(reviewId);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        res.status(200).json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getReviews,
    getReviewById
};
