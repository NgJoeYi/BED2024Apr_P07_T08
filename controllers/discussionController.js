// controllers/discussionController.js
const Discussion = require('../models/Discussion');

const getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.getAll();
    res.render('discussions', { discussions });
  } catch (err) {
    console.error('Error getting discussions:', err);
    res.status(500).send('Server error');
  }
};

const createDiscussion = async (req, res) => {
    try {
      const { title, category, description } = req.body;
      const posted_date = new Date();
      const newDiscussion = await Discussion.create({ title, category, description, posted_date });
      res.json({ success: true, discussion: newDiscussion });
    } catch (err) {
      console.error('Error creating discussion:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  };

const getDiscussionById = async (req, res) => {
  try {
    const { id } = req.params;
    const discussion = await Discussion.getById(id);
    res.render('discussionDetail', { discussion });
  } catch (err) {
    console.error('Error getting discussion:', err);
    res.status(500).send('Server error');
  }
};

const updateDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description } = req.body;
    const posted_date = new Date();
    await Discussion.update(id, { title, category, description, posted_date });
    res.redirect('/discussions');
  } catch (err) {
    console.error('Error updating discussion:', err);
    res.status(500).send('Server error');
  }
};

const deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    await Discussion.delete(id);
    res.redirect('/discussions');
  } catch (err) {
    console.error('Error deleting discussion:', err);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getDiscussions,
  createDiscussion,
  getDiscussionById,
  updateDiscussion,
  deleteDiscussion
};
