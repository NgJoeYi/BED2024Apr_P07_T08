const sql = require('mssql');
const dbConfig = require('../dbConfig');

const getDiscussions = async (req, res) => {
    try {
        const category = req.query.category;
        const sort = req.query.sort;

        let query = `
            SELECT d.id, d.title, d.description, d.category, d.posted_date, d.likes, d.dislikes, u.name AS username
            FROM Discussions d
            LEFT JOIN Users u ON d.user_id = u.id
        `;

        if (category && category !== 'all') {
            query += ` WHERE d.category = '${category}'`;
        }

        if (sort === 'most-recent') {
            query += ` ORDER BY d.posted_date ASC`;
        } else if (sort === 'oldest') {
            query += ` ORDER BY d.posted_date DESC`;
        }

        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query(query);

        res.json({ success: true, discussions: result.recordset });
    } catch (err) {
        console.error('Error getting discussions:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

const createDiscussion = async (req, res) => {
    try {
        if (!req.body.userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { title, category, description, userId } = req.body;
        const posted_date = new Date();

        const pool = await sql.connect(dbConfig);

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

        const userResult = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT name FROM Users WHERE id = @userId');

        const user = userResult.recordset[0];

        const newDiscussion = {
            id: discussionResult.recordset[0].id,
            title: title,
            description: description,
            category: category,
            posted_date: posted_date,
            likes: 0,
            dislikes: 0,
            username: user.name,
            profilePic: 'images/profilePic2.jpeg' // or fetch the actual profile picture URL
        };

        res.json({ success: true, discussion: newDiscussion });
    } catch (err) {
        console.error('Error creating discussion:', err);
        res.status(500).json({ success: false, error: err.message });
    }
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

// Fetch discussions by user ID
const getDiscussionsByUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const query = `
            SELECT d.id, d.title, d.description, d.category, d.posted_date, d.likes, d.dislikes, u.name AS username
            FROM Discussions d
            LEFT JOIN Users u ON d.user_id = u.id
            WHERE d.user_id = @userId
            ORDER BY d.posted_date DESC
        `;

        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(query);

        res.json({ success: true, discussions: result.recordset });
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

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('discussionId', sql.Int, discussionId)
            .input('description', sql.NVarChar, description)
            .input('category', sql.NVarChar, category)
            .input('userId', sql.Int, userId)
            .query(`
                UPDATE Discussions
                SET description = @description, category = @category
                WHERE id = @discussionId AND user_id = @userId
            `);

        res.json({ success: true });
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

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('discussionId', sql.Int, discussionId)
            .input('userId', sql.Int, userId)
            .query('DELETE FROM Discussions WHERE id = @discussionId AND user_id = @userId');

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting discussion:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    getDiscussions,
    getDiscussionsByUser,
    createDiscussion,
    incrementLikes,
    incrementDislikes,
    updateDiscussion,
    deleteDiscussion
};
