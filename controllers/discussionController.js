const Joi = require('joi');
const discussionModel = require('../models/Discussion');

// Joi validation schemas
const discussionSchema = Joi.object({
    title: Joi.string().min(5).required().messages({
        'string.min': 'Title must be at least 5 characters long',
        'any.required': 'Title is required'
    }),
    category: Joi.string().required().messages({
        'any.required': 'Category is required'
    }),
    description: Joi.string().min(10).required().messages({
        'string.min': 'Description must be at least 10 characters long',
        'any.required': 'Description is required'
    })
});

const updateDiscussionSchema = Joi.object({
    category: Joi.string().required().messages({
        'any.required': 'Category is required'
    }),
    description: Joi.string().min(10).required().messages({
        'string.min': 'Description must be at least 10 characters long',
        'any.required': 'Description is required'
    })
});

// Middleware to validate create discussion request
const validateDiscussion = (req, res, next) => {
    const { error } = discussionSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ success: false, errors: error.details.map(err => err.message) });
    }
    next();
};

// Middleware to validate update discussion request
const validateUpdateDiscussion = (req, res, next) => {
    const { error } = updateDiscussionSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ success: false, errors: error.details.map(err => err.message) });
    }
    next();
};

// Controller functions
const getDiscussions = async (req, res) => {
    try {
        const { category = 'all', sort = 'most-recent', search = '' } = req.query;
        const discussions = await discussionModel.getDiscussions(category, sort, search);
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
    const userId = req.user.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    try {
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
    try {
        const discussionId = req.params.id;
        const { description, category } = req.body;
        const userId = req.user.id;

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

const incrementViews = async (req, res) => {
    try {
        const discussionId = req.params.discussionId;
        const views = await discussionModel.incrementViews(discussionId);
        res.json({ success: true, views });
    } catch (err) {
        console.error('Error incrementing views:', err);
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
    validateUpdateDiscussion,
    incrementViews
};
