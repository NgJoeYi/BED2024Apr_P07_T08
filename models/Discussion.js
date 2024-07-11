const sql = require('mssql');
const dbConfig = require('../dbConfig');

class Discussion {
    constructor(id, title, description, category, posted_date, likes, dislikes, username, profilePic, role) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.posted_date = posted_date;
        this.likes = likes;
        this.dislikes = dislikes;
        this.username = username;
        this.profilePic = profilePic;
        this.role = role; 
    }

    // Updated getDiscussions method in the Discussion model
static async getDiscussions(category, sort) {
    try {
        let query = `
            SELECT d.id, d.title, d.description, d.category, d.posted_date, d.likes, d.dislikes, u.name AS username, 
                   ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role
            FROM Discussions d
            LEFT JOIN Users u ON d.user_id = u.id
            LEFT JOIN ProfilePic p ON u.id = p.user_id
        `;

        if (category && category !== 'all') {
            query += ` WHERE d.category = @category`;
        }

        if (sort === 'most-recent') {
            query += ` ORDER BY d.posted_date DESC`;
        } else if (sort === 'oldest') {
            query += ` ORDER BY d.posted_date ASC`;
        }

        const pool = await sql.connect(dbConfig);
        const request = pool.request();

        if (category && category !== 'all') {
            request.input('category', sql.NVarChar, category);
        }

        const result = await request.query(query);
        return result.recordset.map(row => new Discussion(
            row.id, row.title, row.description, row.category, row.posted_date, row.likes, row.dislikes, row.username, row.profilePic, row.role
        ));
    } catch (err) {
        throw new Error(`Error getting discussions: ${err.message}`);
    }
}

    // Fetch a specific discussion by ID
    static async getDiscussionById(discussionId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('discussionId', sql.Int, discussionId)
                .query(`
                    SELECT d.*, u.name AS username, p.img AS profilePic
                    FROM Discussions d
                    JOIN Users u ON d.user_id = u.id
                    LEFT JOIN ProfilePic p ON u.id = p.user_id
                    WHERE d.id = @discussionId
                `);
            const row = result.recordset[0];
            return new Discussion(
                row.id, row.title, row.description, row.category, row.posted_date, row.likes, row.dislikes, row.username, row.profilePic
            );
        } catch (err) {
            throw new Error(`Error fetching discussion details: ${err.message}`);
        }
    }
    

    // Create a new discussion
    static async createDiscussion(title, category, description, userId) {
        try {
            const posted_date = new Date();

            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('title', sql.NVarChar, title)
                .input('description', sql.NVarChar, description)
                .input('category', sql.NVarChar, category)
                .input('posted_date', sql.DateTime, posted_date)
                .input('userId', sql.Int, userId)
                .query(`
                    INSERT INTO Discussions (title, description, category, posted_date, user_id)
                    VALUES (@title, @description, @category, @posted_date, @userId);
                    SELECT SCOPE_IDENTITY() AS id;
                `);

            const discussionId = result.recordset[0].id;
            const userResult = await pool.request()
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT u.name, ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic
                    FROM Users u
                    LEFT JOIN ProfilePic p ON u.id = p.user_id
                    WHERE u.id = @userId
                `);

            const user = userResult.recordset[0];

            return new Discussion(
                discussionId, title, description, category, posted_date, 0, 0, user.name, user.profilePic
            );
        } catch (err) {
            throw new Error(`Error creating discussion: ${err.message}`);
        }
    }

    // Increment likes for a discussion
    static async incrementLikes(discussionId) {
        try {
            const pool = await sql.connect(dbConfig);
            await pool.request()
                .input('discussionId', sql.Int, discussionId)
                .query('UPDATE Discussions SET likes = likes + 1 WHERE id = @discussionId');

            const result = await pool.request()
                .input('discussionId', sql.Int, discussionId)
                .query('SELECT likes FROM Discussions WHERE id = @discussionId');

            return result.recordset[0].likes;
        } catch (err) {
            throw new Error(`Error incrementing likes: ${err.message}`);
        }
    }

    // Increment dislikes for a discussion
    static async incrementDislikes(discussionId) {
        try {
            const pool = await sql.connect(dbConfig);
            await pool.request()
                .input('discussionId', sql.Int, discussionId)
                .query('UPDATE Discussions SET dislikes = dislikes + 1 WHERE id = @discussionId');

            const result = await pool.request()
                .input('discussionId', sql.Int, discussionId)
                .query('SELECT dislikes FROM Discussions WHERE id = @discussionId');

            return result.recordset[0].dislikes;
        } catch (err) {
            throw new Error(`Error incrementing dislikes: ${err.message}`);
        }
    }

    // Fetch discussions by user ID
    static async getDiscussionsByUser(userId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT d.id, d.title, d.description, d.category, d.posted_date, d.likes, d.dislikes, u.name AS username, p.img AS profilePic
                    FROM Discussions d
                    LEFT JOIN Users u ON d.user_id = u.id
                    LEFT JOIN ProfilePic p ON u.id = p.user_id
                    WHERE d.user_id = @userId
                    ORDER BY d.posted_date DESC
                `);
            return result.recordset.map(row => new Discussion(
                row.id, row.title, row.description, row.category, row.posted_date, row.likes, row.dislikes, row.username, row.profilePic
            ));
        } catch (err) {
            throw new Error(`Error getting user discussions: ${err.message}`);
        }
    }
    

    // Update discussion
    static async updateDiscussion(discussionId, description, category, userId) {
        try {
            console.log('Connecting to the database...');
            const pool = await sql.connect(dbConfig);
            console.log('Connected to the database. Executing update query...');
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
            console.log('Update query executed successfully.');
            return true;
        } catch (err) {
            console.error('Error updating discussion:', err);
            throw new Error(`Error updating discussion: ${err.message}`);
        }
    }

    // Delete discussion
    static async deleteDiscussion(discussionId, userId) {
        try {
            const pool = await sql.connect(dbConfig);
            await pool.request()
                .input('discussionId', sql.Int, discussionId)
                .input('userId', sql.Int, userId)
                .query('DELETE FROM Discussions WHERE id = @discussionId AND user_id = @userId');
            return true;
        } catch (err) {
            throw new Error(`Error deleting discussion: ${err.message}`);
        }
    }
}

module.exports = Discussion;
