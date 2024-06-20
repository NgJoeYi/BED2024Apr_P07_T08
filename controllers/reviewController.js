const reviewModel = require('../models/Review');

async function getReviews(req, res) {
    try {
        const reviews = await reviewModel.getAllReviews();
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateReview(req, res) {
    const { id } = req.params;
    const { review_text, rating } = req.body;
    
    try {
        await reviewModel.updateReview(id, review_text, rating);
        res.status(200).json({ message: 'Review updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getReviews,
    updateReview, 
};
