const sql = require('mssql'); // Importing the 'mssql' library for SQL Server operations
// const dbConfig = require('../dbConfig'); // Importing database configuration
const reviewModel = require('../models/Review'); // Importing the Review model

// Get reviews based on course ID, filter, and sort criteria
const getReviews = async (req, res) => {
    const { courseId, filter = 'all', sort = 'mostRecent' } = req.query;
    try {
        let reviews;
        if (courseId) { // If courseId exists, 
            reviews = await reviewModel.getAllReviews(courseId, filter, sort); // Basically Getting reviews by course Id
        } else { // If no courseId, 
            reviews = await reviewModel.getAllReviews(); // Get all reviews
        }
        res.json(reviews); // Send the reviews as JSON response

    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message }); // Send error response
    }
}

// To create a new review
const createReview = async (req, res) => {
    const { review_text, rating, courseId } = req.body;
    const userId = req.user.id; // Get user ID from the authenticated user

    try {
        const result = await reviewModel.createReview(userId, review_text, rating, courseId); // Create a new review
        res.status(201).json({ message: 'Review created successfully', data: result }); // Send success response
    } catch (err) {
        console.error('Error creating review:', err.message);
        res.status(500).json({ error: 'Internal Server Error. Please try again later.' }); // Send error response
    }
}

// To update an existing review
const updateReview = async (req, res) => {
    const { id } = req.params; // Get review ID from request parameters
    const { review_text, rating, courseId } = req.body;
    const userId = req.user.id; // Get user ID from the authenticated user

    try {
        const review = await reviewModel.getReviewById(id); // Get the review by ID
        if (!review) {
            return res.status(404).json({ error: 'Review not found' }); // Send error response if review not found
        }

        const result = await reviewModel.updateReview(id, review_text, rating, courseId);  // Update the review
        res.status(200).json({ message: 'Review updated successfully', data: result }); // Send success response

    } catch (err) {
        console.error('Error updating review:', err.message);
        res.status(500).json({ error: 'Internal Server Error. Please try again later.' }); // Send error response
    }
}

const deleteReview = async (req, res) => {
    const { id } = req.params; // Get review ID from request parameters
    const userId = req.user.id; // Get user ID from the authenticated user

    try {
        const review = await reviewModel.getReviewById(id); // Get the review by ID
        
        if (!review) {
            console.error('Review not found');
            return res.status(404).json({ error: 'Review not found' }); // Send error response if review not found
        }
        
        const result = await reviewModel.deleteReview(id); // Delete the review
        res.status(200).json({ message: 'Review deleted successfully', data: result }); // Send success response
        
    } catch (err) {
        console.error('Error deleting review:', err.message);
        res.status(500).json({ error: err.message }); // Send error response
    }
}

// To get the count of all reviews
const getReviewCount = async (req, res) => {
    try {
        const count = await reviewModel.getReviewCount(); // Get the total count of reviews
        res.json({ count }); // Send the count as JSON response
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching review count"); // Send error response
    }
}

// To get the count of reviews by course ID
const getReviewCountByCourseId = async (req, res) => {
    const { courseId } = req.params; // Get course ID from request parameters
    try {
        const count = await reviewModel.getReviewCountByCourseId(courseId); // Get the count of reviews by course ID
        res.json({ count }); // Send the count as JSON response
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching review count by course ID"); // Send error response
    }
}

// To get the count of reviews by user ID
const getReviewCountByUserId = async (req, res) => {
    const { userId } = req.params; // Get user ID from request parameters
    try {
        const count = await reviewModel.getReviewCountByUserId(userId);  // Get the count of reviews by user ID
        res.json({ count }); // Send the count as JSON response
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching review count by user ID"); // Send error response
    }
}

// To get reviews filtered by star ratings
const getReviewsByRating = async (req, res) => {
    const { rating } = req.params; // Get rating from request parameters
    try {
        const reviews = await reviewModel.getAllReviews(null, rating); // Get reviews by rating + eg can also be 'getAllReviews(sort, null)'
        res.status(200).json(reviews); // Send the reviews as JSON response
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message }); // Send error response
    }
}

// To get reviews sorted by star ratings
const getReviewsSortedByRating = async (req, res) => {
    const { sort } = req.params; // Get sort criteria from request parameters
    try {
        const reviews = await reviewModel.getAllReviews(null, 'all', sort); // Get reviews sorted by rating
        res.status(200).json(reviews);  // Send the reviews as JSON response
    } catch (err) {
        console.error('Server error:', err.message); 
        res.status(500).json({ error: err.message }); // Send error response
    }
}

// To get reviews by course ID
const getReviewsByCourseId = async (req, res) => {
    const { courseId } = req.params; // Get course ID from request parameters
    try {
        const reviews = await reviewModel.getAllReviews(courseId); // Get reviews by course ID
        res.status(200).json(reviews); // Send the reviews as JSON response
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message }); // Send error response
    }
}

// To get reviews by course ID and star ratings
const getReviewsByCourseIdAndRating = async (req, res) => {
    const { courseId, rating } = req.params; // Get course ID and rating from request parameters
    try {
        const reviews = await reviewModel.getAllReviews(courseId, rating); // Get reviews by course ID and rating
        res.status(200).json(reviews); // Send the reviews as JSON response
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message }); // Send error response
    }
}

// To get reviews by course ID and sort condition
const getReviewsByCourseIdAndSort = async (req, res) => {
    const { courseId, sort } = req.params; // Get course ID and sort criteria from request parameters
    try {
        const reviews = await reviewModel.getAllReviews(courseId, 'all', sort); // Get reviews by course ID and sort criteria
        res.status(200).json(reviews); // Send the reviews as JSON response
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message }); // Send error response
    }
}

const incrementLikes = async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const userId = req.body.userId || req.user?.id;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const result = await reviewModel.incrementLikes(reviewId, userId);
        res.json({ success: true, message: result.message, likes: result.likes });
    } catch (err) {
        console.error('Error toggling like:', err);
        res.status(500).json({ success: false, error: err.message });
    }
}

const incrementDislikes = async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const userId = req.body.userId || req.user?.id;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const result = await reviewModel.incrementDislikes(reviewId, userId);
        res.json({ success: true, message: result.message, dislikes: result.dislikes });
    } catch (err) {
        console.error('Error toggling dislike:', err);
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
