const validateDiscussion = require('../middleware/discussionValidation');
const discussionModel = require('../models/Discussion');
require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the GoogleGenerativeAI instance
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Get the specific model instance
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateSuggestion = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(text);
        const response = await result.response;
        const suggestions = response.text();
        return suggestions;
    } catch (error) {
        console.error('Error generating suggestions:', error);
        throw new Error('Failed to generate suggestions');
    }
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
            const suggestions = await generateSuggestion(discussion.description); // Generate suggestions based on the discussion description
            res.json({ success: true, discussion, suggestions });
        } else {
            res.status(404).json({ error: 'Discussion not found' });
        }
    } catch (err) {
        console.error('Error fetching discussion details:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

const createDiscussion = async (req, res) => {
    const userId = req.user.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    try {
        const { title, category, description } = req.body;
        const suggestions = await generateSuggestion(description); // Generate suggestions based on the description
        const newDiscussion = await discussionModel.createDiscussion(title, category, description, userId);
        res.json({ success: true, discussion: newDiscussion, suggestions });
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

const pinDiscussion = async (req, res) => {
    const discussionId = req.params.id;
    try {
        await discussionModel.updateDiscussionPin(discussionId, true);
        res.json({ success: true });
    } catch (error) {
        console.error('Error pinning discussion:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const unpinDiscussion = async (req, res) => {
    const discussionId = req.params.id;
    try {
        await discussionModel.updateDiscussionPin(discussionId, false);
        res.json({ success: true });
    } catch (error) {
        console.error('Error unpinning discussion:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getDiscussionsWithFollowStatus = async (req, res) => {
    const userId = req.user.id;
    const { category = 'all', sort = 'most-recent', search = '' } = req.query;
    try {
        const discussions = await discussionModel.getDiscussionsWithFollowStatus(userId, category, sort, search);
        res.json({ success: true, discussions });
    } catch (err) {
        console.error('Error fetching discussions:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// GEMINI API....
const getSuggestionsForDiscussion = async (req, res) => {
    const discussionId = req.params.id;
    try {
        const discussion = await discussionModel.getDiscussionById(discussionId);
        if (discussion) {
            const suggestions = await generateSuggestion(discussion.description);
            res.json({ success: true, suggestions });
        } else {
            res.status(404).json({ error: 'Discussion not found' });
        }
    } catch (err) {
        console.error('Error fetching suggestions:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Add this to your module exports
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
    incrementViews,
    pinDiscussion,
    unpinDiscussion,
    getDiscussionsWithFollowStatus,
    getSuggestionsForDiscussion
};
