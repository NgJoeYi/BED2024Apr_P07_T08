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

async function createReview(req, res) {
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

// async function updateReview(req, res) {
//     const { id } = req.params;
//     const { review_text, rating, courseId } = req.body;
//     const userId = req.user.id;

//     console.log(`Updating review: id=${id}, userId=${userId}, review_text=${review_text}, rating=${rating}, courseId=${courseId}`);

//     try {
//         const review = await reviewModel.getReviewById(id);
//         if (!review) {
//             return res.status(404).json({ error: 'Review not found' });
//         }
//         if (review.user_id !== userId) {
//             return res.status(403).json({ error: 'You can only edit your own reviews.' });
//         }

//         await reviewModel.updateReview(id, review_text, rating, courseId);
//         res.status(200).json({ message: 'Review updated successfully' });
//     } catch (err) {
//         console.error('Error updating review:', err.message);
//         res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
//     }
// }

async function updateReview(req, res) {
    const { id } = req.params;
    const { review_text, rating, courseId } = req.body;
    const userId = req.user.id;

    console.log(`Updating review: id=${id}, userId=${userId}, review_text=${review_text}, rating=${rating}, courseId=${courseId}`);

    try {
        const review = await reviewModel.getReviewById(id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (review.user_id !== userId) {
            return res.status(403).json({ error: 'You can only edit your own reviews.' });
        }

        await reviewModel.updateReview(id, review_text, rating, courseId);
        res.status(200).json({ message: 'Review updated successfully' });
    } catch (err) {
        console.error('Error updating review:', err.message);
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


async function getReviewsByRating(req, res) {
    const { rating } = req.params;
    try {
        const reviews = await reviewModel.getAllReviews(null, rating);
        res.status(200).json(reviews);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message });
    }
}

async function getReviewsSortedByRating(req, res) {
    const { sort } = req.params;
    try {
        const reviews = await reviewModel.getAllReviews(null, 'all', sort);
        res.status(200).json(reviews);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message });
    }
}

async function getReviewsByCourseId(req, res) {
    const { courseId } = req.params;
    try {
        const reviews = await reviewModel.getAllReviews(courseId);
        res.status(200).json(reviews);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message });
    }
}

async function getReviewsByCourseIdAndRating(req, res) {
    const { courseId, rating } = req.params;
    try {
        const reviews = await reviewModel.getAllReviews(courseId, rating);
        res.status(200).json(reviews);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message });
    }
}

async function getReviewsByCourseIdAndSort(req, res) {
    const { courseId, sort } = req.params;
    try {
        const reviews = await reviewModel.getAllReviews(courseId, 'all', sort);
        res.status(200).json(reviews);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: err.message });
    }
}


module.exports = {
    getReviews,
    updateReview,
    createReview,
    deleteReview,
    getReviewCount,
    getReviewsByRating,
    getReviewsSortedByRating,
    getReviewsByCourseId,
    getReviewsByCourseIdAndRating,
    getReviewsByCourseIdAndSort
};
