const reviewModel = require('../models/Review');

async function getReviews(req, res) {
    try {
        const reviews = await reviewModel.getAllReviews();
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getReviews,
};
