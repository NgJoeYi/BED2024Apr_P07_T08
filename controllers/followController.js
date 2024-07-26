const Follow = require('../models/Follow'); // Import the Follow model

// Controller functions

// Follow a user
const followUser = async (req, res) => {
    const followerId = req.user.id; // Get the ID of the logged-in user
    const { followeeId } = req.body; // Get the ID of the user to be followed from the request body

    // Check if followeeId is a number
    if (isNaN(followeeId)) {
        return res.status(400).json({ success: false, message: 'Invalid followee ID' }); // indicates that the server would not process the request due to something the server considered to be a client error
    }

    try {
        const follow = await Follow.create(followerId, followeeId); // Create a new follow relationship
        res.json({ success: true, follow }); // Send the follow relationship as response
    } catch (err) {
        console.error('Error creating follow:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
    const followerId = req.user.id; // Get the ID of the logged-in user
    const { followeeId } = req.body; // Get the ID of the user to be unfollowed from the request body

    // Check if followeeId is a number
    if (isNaN(followeeId)) {
        return res.status(400).json({ success: false, message: 'Invalid followee ID' });
    }

    try {
        const success = await Follow.delete(followerId, followeeId); // Delete the follow relationship
        res.json({ success }); // Send success status as response
    } catch (err) {
        console.error('Error deleting follow:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get discussions from users that the logged-in user follows
const getFollowedDiscussions = async (req, res) => {
    const userId = req.user.id; // Get the ID of the logged-in user
    try {
        const followedDiscussions = await Follow.getFollowedDiscussions(userId); // Get followed discussions
        res.json({ success: true, discussions: followedDiscussions }); // Send the followed discussions as response
    } catch (err) {
        console.error('Error fetching followed discussions:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Check if the logged-in user is following another user
const checkFollowStatus = async (req, res) => {
    const followerId = req.user.id; // Get the ID of the logged-in user
    const { followeeId } = req.body; // Get the ID of the user to check from the request body

    // Check if followeeId is a number
    if (isNaN(followeeId)) {
        return res.status(400).json({ success: false, message: 'Invalid followee ID' });
    }

    try {
        const isFollowing = await Follow.isFollowing(followerId, followeeId); // Check follow status
        res.json({ success: true, following: isFollowing }); // Send follow status as response
    } catch (err) {
        console.error('Error checking follow status:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get the count of users that the logged-in user is following
const getFollowingCount = async (req, res) => {
    const userId = req.user.id; // Get the ID of the logged-in user
    try {
        const count = await Follow.getFollowingCount(userId); // Get the count of following users
        res.json({ success: true, count }); // Send the count as response
    } catch (err) {
        console.error('Error fetching following count:', err);
        res.status(500).json({ success: false, error: 'Error fetching following count' });
    }
};

// Get the count of users that are following the logged-in user
const getFollowerCount = async (req, res) => {
    const userId = req.user.id; // Get the ID of the logged-in user
    try {
        const count = await Follow.getFollowerCount(userId); // Get the count of followers
        res.json({ success: true, count }); // Send the count as response
    } catch (err) {
        console.error('Error fetching follower count:', err);
        res.status(500).json({ success: false, error: 'Error fetching follower count' });
    }
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowedDiscussions,
    checkFollowStatus,
    getFollowingCount,
    getFollowerCount
};
