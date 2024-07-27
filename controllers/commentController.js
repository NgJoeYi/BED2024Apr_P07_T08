const sql = require('mssql'); // Importing the 'mssql' library for SQL Server operations
const commentModel = require('../models/Comment'); // Importing the Comment model

// Load environment variables (did this for API)
require('dotenv').config();

// Import Google Cloud Translate library
const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate({
    key: process.env.GOOGLE_CLOUD_API_KEY // Using the API key from environment variables
});

// To detect and translate comment content using API
const translateComment = async (text) => {
    try {
        // Detect the language of the text
        const [detection] = await translate.detect(text);
        const sourceLanguage = detection.language;
        console.log('Detected Language:', sourceLanguage);

        if (sourceLanguage === 'en') { // If the source language is English, no translation is needed
            return { translatedContent: null, sourceLanguage };
        }

        // Translate the text to English
        const [translation] = await translate.translate(text, 'en');
        console.log('Translated Content:', translation);

        return { translatedContent: translation, sourceLanguage };

    } catch (error) {
        console.error('Error in translateComment:', error);
        return { translatedContent: null, sourceLanguage: 'Unknown' };
    }
};

// To get comments
const getComments = async (req, res) => {
    const { discussionId } = req.query; // Extract discussionId from query parameters
    try {
        let comments;
        // Get comments for the specific discussion ID if provided, otherwise fetch all comments
        if (discussionId) {
            comments = await commentModel.getCommentsByDiscussionId(discussionId); // Fetch comments for the specific discussion ID if discussion Id exists
        } else {
            comments = await commentModel.getAllComments(); 
        }

        // Detect and translate comments (API)
        for (let comment of comments) {
            const { translatedContent, sourceLanguage } = await translateComment(comment.content);
            comment.translatedContent = translatedContent;
            comment.sourceLanguage = sourceLanguage;
        }

        res.json(comments); // Send the comments as a JSON response
    } catch (err) {
        console.error(err); // Log the error
        res.status(500).send("Error fetching comments"); // Send 500 status code if an error occurs
    } 
};

// To create comments
const createComment = async (req, res) => {
    const { content, discussionId } = req.body;  // Extract content and discussionId from request body
    const userId = req.user.id; // Extract user ID from authenticated user
    try {
        // Detect and translate the comment content
        const { translatedContent, sourceLanguage } = await translateComment(content);

        // Create a new comment in the database with the original, not translated content
        const result = await commentModel.createComment(content, userId, discussionId); // Use original content

        console.log('Comment creation result:', result);

        // Send the created comment and its translation as JSON response with 201 status
        res.status(201).json({ ...result, translatedContent, sourceLanguage });

    } catch (err) {
        console.error('Error creating comment:', err.message);
        res.status(500).send("Error creating comment"); // Send 500 status code if an error occurs
    }
};

// To update comments
const updateComment = async (req, res) => {
    const { id } = req.params; // Extract the comment ID from request parameters
    const { content } = req.body; // Extract content from request body
    const userId = req.user.id; // Extract user ID from authenticated user
    
    try {
        const comment = await commentModel.getCommentById(id); // Fetch existing comment by ID

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' }); // Return 404 if comment not found
        }

        // Detect and translate the comment content
        const { translatedContent, sourceLanguage } = await translateComment(content);

        // Update the comment content in the database
        const updatedComment = await commentModel.updateComment(id, content);
        
        // Add translated content and source language to the response
        res.json({ ...updatedComment, translatedContent, sourceLanguage }); // Send the updated comment and its translation as JSON response

    } catch (err) {
        console.error('Error updating comment:', err.message);
        res.status(500).send("Error updating comment"); // Send 500 status code if an error occurs
    }
};

// To delete comments
const deleteComment = async (req, res) => {
    const { id } = req.params; // Extract comment ID from request params
    const userId = req.user.id; // Extract user ID from authenticated user
    try {
        const comment = await commentModel.getCommentById(id); // Fetch the existing comment by ID

        if (!comment) {
            console.error('Comment not found');
            return res.status(404).json({ error: 'Comment not found' }); // Return 404 if comment not found
        }

        // Delete the comment from the database
        const deletedComment = await commentModel.deleteComment(id);
        res.json(deletedComment); // Send confirmation as JSON response

    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting comment"); // Send 500 status code if an error occurs
    } 
}

// To get number of comments
const getCommentCount = async (req, res) => {
    try {
        const count = await commentModel.getCommentCount(); // Fetch the total count of comments from the database
        res.json({ count }); // Send count as JSON response
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching comment count"); // Send 500 status code if an error occurs
    }
}

// To get number of comments by discussionId
const getCommentCountByDiscussionId = async (req, res) => {
    const { discussionId } = req.params; // Extract discussion ID from request parameters
    try {
        // Fetch the count of comments for the specific discussion
        const count = await commentModel.getCommentCountByDiscussionId(discussionId);
        res.json({ count }); // Send the count as JSON response
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching comment count by discussion ID"); // Send 500 status code if an error occurs
    }
}

// To increase likes for comment
const incrementLikes = async (req, res) => {
    try {
        const commentId = req.params.commentId; // Extract comment ID from request parameters
        const userId = req.body.userId || req.user?.id; // Ensure userId is passed in the request body

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' }); // Return 400 if user ID is missing
        }

        // Increment likes for the comment
        const result = await commentModel.incrementLikes(commentId, userId);
        res.json({ success: true, message: result.message, likes: result.likes }); // Send success response with updated amount of likes

    } catch (err) {
        console.error('Error toggling like:', err);
        res.status(500).json({ success: false, error: err.message }); // Send 500 status code if an error occurs
    }
}

// To increase dislikes for comment
const incrementDislikes = async (req, res) => {
    try {
        const commentId = req.params.commentId; // Extract comment ID from request parameters
        const userId = req.body.userId || req.user?.id; // Ensure userId is passed in the request body

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' }); // Return 400 if user ID is missing
        }

        const result = await commentModel.incrementDislikes(commentId, userId);
        res.json({ success: true, message: result.message, dislikes: result.dislikes }); // Send success response with updated amount of dislikes
    } catch (err) {
        console.error('Error toggling dislike:', err);
        res.status(500).json({ success: false, error: err.message }); // Send 500 status code if an error occurs
    }
}


module.exports = {
    getComments,
    createComment,
    updateComment,
    deleteComment,
    getCommentCount,
    getCommentCountByDiscussionId,
    incrementLikes,
    incrementDislikes,
};
