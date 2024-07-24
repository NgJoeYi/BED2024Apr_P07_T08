const sql = require('mssql');
const dbConfig = require('../dbConfig');

class Discussion {
    constructor(id, title, description, category, posted_date, likes, dislikes, views, username, profilePic, role, pinned) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.posted_date = posted_date;
        this.likes = likes;
        this.dislikes = dislikes;
        this.views = views;
        this.username = username;
        this.profilePic = profilePic;
        this.role = role; 
        this.pinned = pinned; // Add pinned attribute
    }

    static async getDiscussions(category, sort, search) {
        try {
            let query = `
                SELECT d.id, d.title, d.description, d.category, d.posted_date, d.likes, d.dislikes, d.views, u.name AS username, 
                       ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role, d.pinned
                FROM Discussions d
                LEFT JOIN Users u ON d.user_id = u.id
                LEFT JOIN ProfilePic p ON u.id = p.user_id
                WHERE 1=1
            `;
    
            if (category && category !== 'all') {
                query += ` AND d.category = @category`;
            }
    
            if (search) {
                query += ` AND (d.title LIKE @search OR d.description LIKE @search)`;
            }

            query += ` ORDER BY d.pinned DESC, d.posted_date DESC`; // Sort pinned discussions to the top
    
            const pool = await sql.connect(dbConfig);
            const request = pool.request();
    
            if (category && category !== 'all') {
                request.input('category', sql.NVarChar, category);
            }
    
            if (search) {
                request.input('search', sql.NVarChar, `%${search}%`);
            }
    
            const result = await request.query(query);
            return result.recordset.map(row => new Discussion(
                row.id, row.title, row.description, row.category, row.posted_date, row.likes, row.dislikes, row.views, row.username, row.profilePic, row.role, row.pinned
            ));
        } catch (err) {
            throw new Error(`Error getting discussions: ${err.message}`);
        }
    }

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
                row.id, row.title, row.description, row.category, row.posted_date, row.likes, row.dislikes, row.views, row.username, row.profilePic, row.role, row.pinned
            );
        } catch (err) {
            throw new Error(`Error fetching discussion details: ${err.message}`);
        }
    }

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
                    INSERT INTO Discussions (title, description, category, posted_date, user_id, views, pinned)
                    VALUES (@title, @description, @category, @posted_date, @userId, 0, 0);
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
                discussionId, title, description, category, posted_date, 0, 0, 0, user.name, user.profilePic, user.role, false
            );
        } catch (err) {
            throw new Error(`Error creating discussion: ${err.message}`);
        }
    }

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

    static async incrementViews(discussionId) {
        try {
            const pool = await sql.connect(dbConfig);
            await pool.request()
                .input('discussionId', sql.Int, discussionId)
                .query('UPDATE Discussions SET views = views + 1 WHERE id = @discussionId');

            const result = await pool.request()
                .input('discussionId', sql.Int, discussionId)
                .query('SELECT views FROM Discussions WHERE id = @discussionId');

            return result.recordset[0].views;
        } catch (err) {
            throw new Error(`Error incrementing views: ${err.message}`);
        }
    }

    static async getDiscussionsByUser(userId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT d.id, d.title, d.description, d.category, d.posted_date, d.likes, d.dislikes, d.views, u.name AS username, p.img AS profilePic, d.pinned
                    FROM Discussions d
                    LEFT JOIN Users u ON d.user_id = u.id
                    LEFT JOIN ProfilePic p ON u.id = p.user_id
                    WHERE d.user_id = @userId
                    ORDER BY d.posted_date DESC
                `);
            return result.recordset.map(row => new Discussion(
                row.id, row.title, row.description, row.category, row.posted_date, row.likes, row.dislikes, row.views, row.username, row.profilePic, row.role, row.pinned
            ));
        } catch (err) {
            throw new Error(`Error getting user discussions: ${err.message}`);
        }
    }

    static async updateDiscussion(discussionId, description, category, userId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('discussionId', sql.Int, discussionId)
                .input('description', sql.NVarChar, description)
                .input('category', sql.NVarChar, category)
                .input('userId', sql.Int, userId)
                .query(`
                    UPDATE Discussions
                    SET description = @description, category = @category
                    WHERE id = @discussionId AND user_id = @userId
                `);
    
            return result.rowsAffected[0] > 0;
        } catch (err) {
            throw new Error(`Error updating discussion: ${err.message}`);
        }
    }
    

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

    static async updateDiscussionPin(discussionId, pinned) {
        try {
            const pool = await sql.connect(dbConfig);
            await pool.request()
                .input('discussionId', sql.Int, discussionId)
                .input('pinned', sql.Bit, pinned)
                .query('UPDATE Discussions SET pinned = @pinned WHERE id = @discussionId');
            return true;
        } catch (err) {
            throw new Error(`Error updating discussion pin: ${err.message}`);
        }
    }
}

module.exports = Discussion;
