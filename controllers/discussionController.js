const sql = require('mssql');
const dbConfig = require('../dbConfig');

const getDiscussions = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
            SELECT d.id, d.title, d.description, d.category, d.posted_date, d.likes, d.dislikes, u.name AS username
            FROM Discussions d
            LEFT JOIN Users u ON d.user_id = u.id
        `);
        res.json({ success: true, discussions: result.recordset });
    } catch (err) {
        console.error('Error getting discussions:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

const createDiscussion = async (req, res) => {
    try {
        const { title, category, description, userId } = req.body;
        const posted_date = new Date();

        const pool = await sql.connect(dbConfig);

        const userResult = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT name FROM Users WHERE id = @userId');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const user = userResult.recordset[0];

        const discussionResult = await pool.request()
            .input('title', sql.NVarChar, title)
            .input('description', sql.NVarChar, description)
            .input('category', sql.NVarChar, category)
            .input('posted_date', sql.DateTime, posted_date)
            .input('user_id', sql.Int, userId)
            .query(`
                INSERT INTO Discussions (title, description, category, posted_date, user_id)
                VALUES (@title, @description, @category, @posted_date, @user_id);
                SELECT SCOPE_IDENTITY() AS id;
            `);

        const newDiscussion = {
            id: discussionResult.recordset[0].id,
            title: title,
            description: description,
            category: category,
            posted_date: posted_date,
            likes: 0,
            dislikes: 0,
            username: user.name
        };

        res.json({ success: true, discussion: newDiscussion });
    } catch (err) {
        console.error('Error creating discussion:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Add these placeholder functions for routes
const getDiscussionById = async (req, res) => {
    // Placeholder logic
    res.status(200).send("getDiscussionById function placeholder");
};

const updateDiscussion = async (req, res) => {
    // Placeholder logic
    res.status(200).send("updateDiscussion function placeholder");
};

const deleteDiscussion = async (req, res) => {
    // Placeholder logic
    res.status(200).send("deleteDiscussion function placeholder");
};

const incrementLikes = async (req, res) => {
    try {
        const { discussionId } = req.body;

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('discussionId', sql.Int, discussionId)
            .query('UPDATE Discussions SET likes = likes + 1 WHERE id = @discussionId');

        const result = await pool.request()
            .input('discussionId', sql.Int, discussionId)
            .query('SELECT likes FROM Discussions WHERE id = @discussionId');

        res.json({ success: true, likes: result.recordset[0].likes });
    } catch (err) {
        console.error('Error incrementing likes:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

const incrementDislikes = async (req, res) => {
    try {
        const { discussionId } = req.body;

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('discussionId', sql.Int, discussionId)
            .query('UPDATE Discussions SET dislikes = dislikes + 1 WHERE id = @discussionId');

        const result = await pool.request()
            .input('discussionId', sql.Int, discussionId)
            .query('SELECT dislikes FROM Discussions WHERE id = @discussionId');

        res.json({ success: true, dislikes: result.recordset[0].dislikes });
    } catch (err) {
        console.error('Error incrementing dislikes:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    getDiscussions,
    createDiscussion,
    getDiscussionById,
    updateDiscussion,
    deleteDiscussion,
    incrementLikes,
    incrementDislikes
};
