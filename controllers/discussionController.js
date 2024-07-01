const discussionModel = require('../models/Discussion');

// Fetch all discussions
const getDiscussions = async (req, res) => {
    try {
        const category = req.query.category;
        const sort = req.query.sort;
        const discussions = await discussionModel.getDiscussions(category, sort);
        res.json({ success: true, discussions });
    } catch (err) {
        console.error('Error getting discussions:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Fetch a specific discussion by ID
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

// Create a new discussion
const createDiscussion = async (req, res) => {
    try {
        if (!req.body.userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const { title, category, description, userId } = req.body;
        const newDiscussion = await discussionModel.createDiscussion(title, category, description, userId);
        res.json({ success: true, discussion: newDiscussion });
    } catch (err) {
        console.error('Error creating discussion:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Increment likes for a discussion
const incrementLikes = async (req, res) => {
    try {
        const { discussionId } = req.body;
        const likes = await discussionModel.incrementLikes(discussionId);
        res.json({ success: true, likes });
    } catch (err) {
        console.error('Error incrementing likes:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Increment dislikes for a discussion
const incrementDislikes = async (req, res) => {
    try {
        const { discussionId } = req.body;
        const dislikes = await discussionModel.incrementDislikes(discussionId);
        res.json({ success: true, dislikes });
    } catch (err) {
        console.error('Error incrementing dislikes:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Fetch discussions by user ID
const getDiscussionsByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const discussions = await discussionModel.getDiscussionsByUser(userId);
        res.json({ success: true, discussions });
    } catch (err) {
        console.error('Error getting user discussions:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Update discussion
const updateDiscussion = async (req, res) => {
    try {
        const discussionId = req.params.id;
        const { description, category, userId } = req.body;
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

// Delete discussion
const deleteDiscussion = async (req, res) => {
    try {
        const discussionId = req.params.id;
        const { userId } = req.body;
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
    deleteDiscussion
};
