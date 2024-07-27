const validateDiscussion = require('../middleware/discussionValidation'); // Import middleware for validating create and update discussion data
const discussionModel = require('../models/Discussion'); // Import the discussion model
require('dotenv').config(); // Load environment variables from a .env file

const { GoogleGenerativeAI } = require("@google/generative-ai"); // Import Google Generative AI library

// Initialize the GoogleGenerativeAI instance with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Get the specific model instance for generating content
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to generate suggestions based on text input
const generateSuggestion = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Initialize the latest model 
        const result = await model.generateContent(text); // Generate content based on the input text - which is the description
        const response = await result.response; // Wait for the response
        const suggestions = response.text(); // Extract suggestions from the response
        return suggestions; // Return the suggestions
    } catch (error) {
        console.error('Error generating suggestions:', error); // Log the error
        throw new Error('Failed to generate suggestions'); // Throw an error if generation fails
    }
};

// Controller function to get all discussions with optional filters
const getDiscussions = async (req, res) => {
    try {
        const { category = 'all', sort = 'most-recent', search = '' } = req.query; // Get query parameters or set defaults
        const userId = req.user ? req.user.id : null; // Get userId if logged in, otherwise null
        const discussions = await discussionModel.getDiscussions(userId, category, sort, search); // Fetch discussions from the model
        res.json({ success: true, discussions }); // Return discussions as JSON response
    } catch (err) {
        console.error('Error getting discussions:', err); // Log the error
        res.status(500).json({ success: false, error: err.message }); // Return error response
    }
};

// Controller function to get a specific discussion by ID
const getDiscussionById = async (req, res) => {
    const discussionId = req.params.id; // Get discussion ID from route parameters
    try {
        const discussion = await discussionModel.getDiscussionById(discussionId); // Fetch discussion from the model
        if (discussion) {
            const suggestions = await generateSuggestion(discussion.description); // Generate suggestions based on discussion description
            res.json({ success: true, discussion, suggestions }); // Return discussion and suggestions
        } else {
            res.status(404).json({ error: 'Discussion not found' }); // Return 404 if discussion not found
        }
    } catch (err) {
        console.error('Error fetching discussion details:', err); // Log the error
        res.status(500).json({ success: false, error: 'Internal server error' }); // Return error response
    }
};

// Controller function to create a new discussion
const createDiscussion = async (req, res) => {
    const userId = req.user.id; // Get user ID from the logged-in user
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' }); // Return 401 if user is not authenticated
    }
    try {
        const { title, category, description } = req.body; // Get discussion data from request body
        const suggestions = await generateSuggestion(description); // Generate suggestions based on discussion description
        const newDiscussion = await discussionModel.createDiscussion(title, category, description, userId); // Create new discussion
        res.json({ success: true, discussion: newDiscussion, suggestions }); // Return new discussion and suggestions
    } catch (err) {
        console.error('Error creating discussion:', err); // Log the error
        res.status(500).json({ success: false, error: err.message }); // Return error response
    }
};

// Controller function to increment likes for a discussion
const incrementLikes = async (req, res) => {
    try {
        const discussionId = req.params.discussionId; // Get discussion ID from route parameters
        const userId = req.user.id; // Get the user ID from the request

        const likes = await discussionModel.incrementLikes(discussionId, userId); // Increment likes in the model
        res.json({ success: true, likes }); // Return updated likes count
    } catch (err) {
        console.error('Error incrementing likes:', err); // Log the error
        res.status(500).json({ success: false, error: err.message }); // Return error response
    }
};

// Controller function to increment dislikes for a discussion
const incrementDislikes = async (req, res) => {
    try {
        const discussionId = req.params.discussionId; // Get discussion ID from route parameters
        const userId = req.user.id; // Get the user ID from the request

        const dislikes = await discussionModel.incrementDislikes(discussionId, userId); // Increment dislikes in the model
        res.json({ success: true, dislikes }); // Return updated dislikes count
    } catch (err) {
        console.error('Error incrementing dislikes:', err); // Log the error
        res.status(500).json({ success: false, error: err.message }); // Return error response
    }
};

// Controller function to get discussions created by a specific user
const getDiscussionsByUser = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from the logged-in user
        const discussions = await discussionModel.getDiscussionsByUser(userId); // Fetch user's discussions from the model
        res.status(200).json({ success: true, discussions }); // Return user's discussions
    } catch (err) {
        console.error('Error getting user discussions:', err); // Log the error
        res.status(500).json({ success: false, error: err.message }); // Return error response
    }
};

// Controller function to update a discussion
const updateDiscussion = async (req, res) => {
    try {
        const discussionId = req.params.id; // Get discussion ID from route parameters
        const { description, category } = req.body; // Get updated data from request body
        const userId = req.user.id; // Get user ID from the logged-in user

        const success = await discussionModel.updateDiscussion(discussionId, description, category, userId); // Update discussion in the model
        if (success) {
            res.json({ success: true }); // Return success if update is successful
        } else {
            res.status(404).json({ success: false, error: 'Discussion not found or user unauthorized' }); // Return 404 if discussion not found or user not authorized
        }
    } catch (err) {
        console.error('Error updating discussion:', err); // Log the error
        res.status(500).json({ success: false, error: err.message }); // Return error response
    }
};

// Controller function to delete a discussion
const deleteDiscussion = async (req, res) => {
    try {
        const discussionId = req.params.id; // Get discussion ID from route parameters
        const userId = req.user.id; // Get user ID from the logged-in user
        const success = await discussionModel.deleteDiscussion(discussionId, userId); // Delete discussion from the model
        if (success) {
            res.json({ success: true }); // Return success if deletion is successful
        } else {
            res.status(404).json({ success: false, error: 'Discussion not found or user unauthorized' }); // Return 404 if discussion not found or user not authorized
        }
    } catch (err) {
        console.error('Error deleting discussion:', err); // Log the error
        res.status(500).json({ success: false, error: err.message }); // Return error response
    }
};

// Controller function to increment views for a discussion
const incrementViews = async (req, res) => {
    try {
        const discussionId = req.params.discussionId; // Get discussion ID from route parameters
        const views = await discussionModel.incrementViews(discussionId); // Increment views in the model
        res.json({ success: true, views }); // Return updated views count
    } catch (err) {
        console.error('Error incrementing views:', err); // Log the error
        res.status(500).json({ success: false, error: err.message }); // Return error response
    }
};

// Controller function to pin a discussion
const pinDiscussion = async (req, res) => {
    const discussionId = req.params.id; // Get discussion ID from route parameters
    try {
        await discussionModel.updateDiscussionPin(discussionId, true); // Update discussion to be pinned
        res.json({ success: true }); // Return success
    } catch (error) {
        console.error('Error pinning discussion:', error); // Log the error
        res.status(500).json({ success: false, error: error.message }); // Return error response
    }
};

// Controller function to unpin a discussion
const unpinDiscussion = async (req, res) => {
    const discussionId = req.params.id; // Get discussion ID from route parameters
    try {
        await discussionModel.updateDiscussionPin(discussionId, false); // Update discussion to be unpinned
        res.json({ success: true }); // Return success
    } catch (error) {
        console.error('Error unpinning discussion:', error); // Log the error
        res.status(500).json({ success: false, error: error.message }); // Return error response
    }
};

// Controller function to get discussions with follow status for a user
const getDiscussionsWithFollowStatus = async (req, res) => {
    const userId = req.user.id; // Get user ID from the logged-in user
    const { category = 'all', sort = 'most-recent', search = '' } = req.query; // Get query parameters or set defaults
    try {
        const discussions = await discussionModel.getDiscussionsWithFollowStatus(userId, category, sort, search); // Fetch discussions with follow status
        res.json({ success: true, discussions }); // Return discussions with follow status
    } catch (err) {
        console.error('Error fetching discussions:', err); // Log the error
        res.status(500).json({ success: false, error: err.message }); // Return error response
    }
};

// Controller function to get suggestions for a specific discussion
const getSuggestionsForDiscussion = async (req, res) => {
    const discussionId = req.params.id; // Get discussion ID from route parameters
    try {
        const discussion = await discussionModel.getDiscussionById(discussionId); // Fetch discussion from the model
        if (discussion) {
            const suggestions = await generateSuggestion(discussion.description); // Generate suggestions based on discussion description
            res.json({ success: true, suggestions }); // Return suggestions
        } else {
            res.status(404).json({ error: 'Discussion not found' }); // Return 404 if discussion not found
        }
    } catch (err) {
        console.error('Error fetching suggestions:', err); // Log the error
        res.status(500).json({ success: false, error: err.message }); // Return error response
    }
};

// Export all controller functions for use in routes
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
