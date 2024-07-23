const sql = require('mssql');
const dbConfig = require('../dbConfig');
const reviewModel = require('../models/Review');

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get all reviews
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: ID of the course to filter reviews
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           default: all
 *         description: Filter for reviews
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: mostRecent
 *         description: Sort order of reviews
 *     responses:
 *       200:
 *         description: A list of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       500:
 *         description: Error retrieving reviews
 */
const getReviews = async (req, res) => {
    const { courseId, filter = 'all', sort = 'mostRecent' } = req.query;
    try {
        let reviews;
        if (courseId) {
            reviews = await reviewModel.getAllReviews(courseId, filter, sort); // Basically Getting reviews by course Id
        } else {
            reviews = await reviewModel.getAllReviews();
        }
        res.json(reviews);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message });
    }
}

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - review_text
 *               - rating
 *               - courseId
 *             properties:
 *               review_text:
 *                 type: string
 *               rating:
 *                 type: number
 *               courseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       500:
 *         description: Error creating review
 */
const createReview = async (req, res) => {
    const { review_text, rating, courseId } = req.body;
    const userId = req.user.id;

    try {
        const result = await reviewModel.createReview(userId, review_text, rating, courseId);
        res.status(201).json({ message: 'Review created successfully', data: result });
    } catch (err) {
        console.error('Error creating review:', err.message);
        res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
    }
}

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the review to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               review_text:
 *                 type: string
 *               rating:
 *                 type: number
 *               courseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       404:
 *         description: Review not found
 *       500:
 *         description: Error updating review
 */
const updateReview = async (req, res) => {
    const { id } = req.params; // Review Id
    const { review_text, rating, courseId } = req.body;
    const userId = req.user.id; // User Id

    try {
        const review = await reviewModel.getReviewById(id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        const result = await reviewModel.updateReview(id, review_text, rating, courseId);
        res.status(200).json({ message: 'Review updated successfully', data: result });

    } catch (err) {
        console.error('Error updating review:', err.message);
        res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
    }
}

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the review to delete
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       404:
 *         description: Review not found
 *       500:
 *         description: Error deleting review
 */
const deleteReview = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const review = await reviewModel.getReviewById(id);
        
        if (!review) {
            console.error('Review not found');
            return res.status(404).json({ error: 'Review not found' });
        }
        
        const result = await reviewModel.deleteReview(id);
        res.status(200).json({ message: 'Review deleted successfully', data: result });
        
    } catch (err) {
        console.error('Error deleting review:', err.message);
        res.status(500).json({ error: err.message });
    }
}

/**
 * @swagger
 * /reviews/count:
 *   get:
 *     summary: Get review count
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Review count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *       500:
 *         description: Error fetching review count
 */
const getReviewCount = async (req, res) => {
    try {
        const count = await reviewModel.getReviewCount();
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching review count");
    }
}

/**
 * @swagger
 * /reviews/count/course/{courseId}:
 *   get:
 *     summary: Get review count by course ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course
 *     responses:
 *       200:
 *         description: Review count by course ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *       500:
 *         description: Error fetching review count by course ID
 */
const getReviewCountByCourseId = async (req, res) => {
    const { courseId } = req.params;
    try {
        const count = await reviewModel.getReviewCountByCourseId(courseId);
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching review count by course ID");
    }
}

/**
 * @swagger
 * /reviews/count/user/{userId}:
 *   get:
 *     summary: Get review count by user ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: Review count by user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *       500:
 *         description: Error fetching review count by user ID
 */
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

/**
 * @swagger
 * /reviews/rating/{rating}:
 *   get:
 *     summary: Get reviews by rating
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: rating
 *         schema:
 *           type: number
 *         required: true
 *         description: Rating to filter reviews
 *     responses:
 *       200:
 *         description: Reviews by rating
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       500:
 *         description: Error retrieving reviews by rating
 */
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

/**
 * @swagger
 * /reviews/sort/{sort}:
 *   get:
 *     summary: Get reviews sorted by rating
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: sort
 *         schema:
 *           type: string
 *         required: true
 *         description: Sort order of reviews
 *     responses:
 *       200:
 *         description: Reviews sorted by rating
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       500:
 *         description: Error retrieving reviews sorted by rating
 */
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

/**
 * @swagger
 * /reviews/course/{courseId}:
 *   get:
 *     summary: Get reviews by course ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course
 *     responses:
 *       200:
 *         description: Reviews by course ID
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       500:
 *         description: Error retrieving reviews by course ID
 */
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

/**
 * @swagger
 * /reviews/course/{courseId}/rating/{rating}:
 *   get:
 *     summary: Get reviews by course ID and rating
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course
 *       - in: path
 *         name: rating
 *         schema:
 *           type: number
 *         required: true
 *         description: Rating to filter reviews
 *     responses:
 *       200:
 *         description: Reviews by course ID and rating
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       500:
 *         description: Error retrieving reviews by course ID and rating
 */
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

/**
 * @swagger
 * /reviews/course/{courseId}/sort/{sort}:
 *   get:
 *     summary: Get reviews by course ID and sort order
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course
 *       - in: path
 *         name: sort
 *         schema:
 *           type: string
 *         required: true
 *         description: Sort order of reviews
 *     responses:
 *       200:
 *         description: Reviews by course ID and sort order
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       500:
 *         description: Error retrieving reviews by course ID and sort order
 */
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

/**
 * @swagger
 * /reviews/{reviewId}/likes:
 *   post:
 *     summary: Increment likes on a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the review to like
 *     responses:
 *       200:
 *         description: Successfully incremented likes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 likes:
 *                   type: number
 *       500:
 *         description: Error incrementing likes
 */
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

/**
 * @swagger
 * /reviews/{reviewId}/dislikes:
 *   post:
 *     summary: Increment dislikes on a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the review to dislike
 *     responses:
 *       200:
 *         description: Successfully incremented dislikes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 dislikes:
 *                   type: number
 *       500:
 *         description: Error incrementing dislikes
 */
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
