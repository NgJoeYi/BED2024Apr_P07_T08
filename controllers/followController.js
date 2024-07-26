const Follow = require('../models/Follow');
const discussionModel = require('../models/Discussion');

// Controller functions

const followUser = async (req, res) => {
    const followerId = req.user.id;
    const { followeeId } = req.body;

    if (isNaN(followeeId)) {
        return res.status(400).json({ success: false, message: 'Invalid followee ID' });
    }

    try {
        const follow = await Follow.create(followerId, followeeId);
        res.json({ success: true, follow });
    } catch (err) {
        console.error('Error creating follow:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};



const unfollowUser = async (req, res) => {
    const followerId = req.user.id;
    const { followeeId } = req.body;

    if (isNaN(followeeId)) {
        return res.status(400).json({ success: false, message: 'Invalid followee ID' });
    }

    try {
        const success = await Follow.delete(followerId, followeeId);
        res.json({ success });
    } catch (err) {
        console.error('Error deleting follow:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};


const getFollowedDiscussions = async (req, res) => {
    const userId = req.user.id;
    try {
        const followedDiscussions = await Follow.getFollowedDiscussions(userId);
        res.json({ success: true, discussions: followedDiscussions });
    } catch (err) {
        console.error('Error fetching followed discussions:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

const checkFollowStatus = async (req, res) => {
    const followerId = req.user.id;
    const { followeeId } = req.body;

    if (isNaN(followeeId)) {
        return res.status(400).json({ success: false, message: 'Invalid followee ID' });
    }

    try {
        const isFollowing = await Follow.isFollowing(followerId, followeeId);
        res.json({ success: true, following: isFollowing });
    } catch (err) {
        console.error('Error checking follow status:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};



module.exports = {
    followUser,
    unfollowUser,
    getFollowedDiscussions,
    checkFollowStatus
    
};
