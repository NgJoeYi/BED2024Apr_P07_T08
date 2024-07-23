const validateDiscussion = require('../middleware/discussionValidation');
const discussionModel = require('../models/Discussion');

// Controller functions
/**
 * @swagger
 * /discussions:
 *   get:
 *     summary: Get all discussions
 *     tags: [Discussions]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           default: all
 *         description: Category to filter discussions
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: most-recent
 *         description: Sort order of discussions
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           default: ''
 *         description: Search term to filter discussions
 *     responses:
 *       200:
 *         description: A list of discussions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Discussion'
 *       500:
 *         description: Error retrieving discussions
 */
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

/**
 * @swagger
 * /discussions/{id}:
 *   get:
 *     summary: Get a discussion by ID
 *     tags: [Discussions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the discussion to get
 *     responses:
 *       200:
 *         description: A single discussion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Discussion'
 *       404:
 *         description: Discussion not found
 *       500:
 *         description: Error fetching discussion details
 */
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

/**
 * @swagger
 * /discussions:
 *   post:
 *     summary: Create a new discussion
 *     tags: [Discussions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully created discussion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Discussion'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error creating discussion
 */
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

/**
 * @swagger
 * /discussions/{discussionId}/likes:
 *   post:
 *     summary: Increment likes on a discussion
 *     tags: [Discussions]
 *     parameters:
 *       - in: path
 *         name: discussionId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the discussion to like
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
        const discussionId = req.params.discussionId;
        const likes = await discussionModel.incrementLikes(discussionId);
        res.json({ success: true, likes });
    } catch (err) {
        console.error('Error incrementing likes:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @swagger
 * /discussions/{discussionId}/dislikes:
 *   post:
 *     summary: Increment dislikes on a discussion
 *     tags: [Discussions]
 *     parameters:
 *       - in: path
 *         name: discussionId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the discussion to dislike
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
        const discussionId = req.params.discussionId;
        const dislikes = await discussionModel.incrementDislikes(discussionId);
        res.json({ success: true, dislikes });
    } catch (err) {
        console.error('Error incrementing dislikes:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @swagger
 * /users/discussions:
 *   get:
 *     summary: Get discussions by user
 *     tags: [Discussions]
 *     responses:
 *       200:
 *         description: Successfully retrieved user discussions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Discussion'
 *       500:
 *         description: Error retrieving user discussions
 */
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

/**
 * @swagger
 * /discussions/{id}:
 *   put:
 *     summary: Update a discussion
 *     tags: [Discussions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the discussion to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated discussion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Discussion not found or user unauthorized
 *       500:
 *         description: Error updating discussion
 */
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

/**
 * @swagger
 * /discussions/{id}:
 *   delete:
 *     summary: Delete a discussion
 *     tags: [Discussions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the discussion to delete
 *     responses:
 *       200:
 *         description: Successfully deleted discussion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Discussion not found or user unauthorized
 *       500:
 *         description: Error deleting discussion
 */
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

/**
 * @swagger
 * /discussions/{discussionId}/views:
 *   post:
 *     summary: Increment views on a discussion
 *     tags: [Discussions]
 *     parameters:
 *       - in: path
 *         name: discussionId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the discussion to increment views
 *     responses:
 *       200:
 *         description: Successfully incremented views
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 views:
 *                   type: number
 *       500:
 *         description: Error incrementing views
 */
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

/**
 * @swagger
 * /discussions/{id}/pin:
 *   post:
 *     summary: Pin a discussion
 *     tags: [Discussions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the discussion to pin
 *     responses:
 *       200:
 *         description: Successfully pinned discussion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Error pinning discussion
 */
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

/**
 * @swagger
 * /discussions/{id}/unpin:
 *   post:
 *     summary: Unpin a discussion
 *     tags: [Discussions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the discussion to unpin
 *     responses:
 *       200:
 *         description: Successfully unpinned discussion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Error unpinning discussion
 */
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

module.exports = {
    getDiscussions,
    getDiscussionById,
    createDiscussion,
    incrementLikes,
    incrementDislikes,
    getDiscussionsByUser,
    updateDiscussion,
    deleteDiscussion,
    validateDiscussion, // Importing the validateDiscussion function here
    incrementViews,
    pinDiscussion,
    unpinDiscussion
};
