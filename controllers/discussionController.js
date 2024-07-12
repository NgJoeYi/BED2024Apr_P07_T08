const { validationResult, check } = require('express-validator');
const discussionModel = require('../models/Discussion');

// Validation rules
const validateDiscussion = [
    check('title').isLength({ min: 5 }).withMessage('Title must be at least 5 characters long'),
    check('category').notEmpty().withMessage('Category is required'),
    check('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters long')
];

// Validation rules for updating a discussion
const validateUpdateDiscussion = [
    check('category').notEmpty().withMessage('Category is required'),
    check('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters long')
];

const getDiscussions = async (req, res) => {
    try {
        const { category = 'all', sort = 'most-recent' } = req.query;
        const discussions = await discussionModel.getDiscussions(category, sort);
        res.json({ success: true, discussions });
    } catch (err) {
        console.error('Error getting discussions:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

const getDiscussionById = async (req, res) => {
    const discussionId = req.params.id;
    try {
        const discussion = await discussionModel.getDiscussionById(discussionId);
        if (discussion) {
            res.json(discussion);
        } else {
            res.status(404).json({ error: 'Discussion not found' });
        }
    } catch (err) {
        console.error('Error fetching discussion details:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createDiscussion = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const { title, category, description } = req.body;
        const newDiscussion = await discussionModel.createDiscussion(title, category, description, userId);
        res.json({ success: true, discussion: newDiscussion });
    } catch (err) {
        console.error('Error creating discussion:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

const incrementLikes = async (req, res) => {
    try {
        const discussionId = req.params.discussionId;
        const likes = await discussionModel.incrementLikes(discussionId);
        res.json({ success: true, likes });
    } catch (err) {
        console.error('Error incrementing likes:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

const incrementDislikes = async (req, res) => {
    try {
        const discussionId = req.params.discussionId;
        const dislikes = await discussionModel.incrementDislikes(discussionId);
        res.json({ success: true, dislikes });
    } catch (err) {
        console.error('Error incrementing dislikes:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

const getDiscussionsByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const discussions = await discussionModel.getDiscussionsByUser(userId);
        res.status(200).json({ success: true, discussions });
    } catch (err) {
        console.error('Error getting user discussions:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

const updateDiscussion = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const discussionId = req.params.id;
        const { description, category } = req.body;
        const userId = req.user.id;

        console.log('Request payload:', { discussionId, description, category, userId });

        const success = await discussionModel.updateDiscussion(discussionId, description, category, userId);
        if (success) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Discussion not found or user unauthorized' });
        }
    } catch (err) {
        console.error('Error updating discussion:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};



const deleteDiscussion = async (req, res) => {
    try {
        const discussionId = req.params.id;
        const userId = req.user.id;
        const success = await discussionModel.deleteDiscussion(discussionId, userId);
        if (success) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Discussion not found or user unauthorized' });
        }
    } catch (err) {
        console.error('Error deleting discussion:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    getDiscussions,
    getDiscussionById,
    createDiscussion,
    incrementLikes,
    incrementDislikes,
    getDiscussionsByUser,
    updateDiscussion,
    deleteDiscussion,
    validateDiscussion,
    validateUpdateDiscussion
};
