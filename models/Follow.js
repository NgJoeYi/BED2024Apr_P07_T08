const sql = require('mssql');
const dbConfig = require('../dbConfig');

class Follow {
    constructor(id, followerId, followeeId) {
        this.id = id;
        this.followerId = followerId;
        this.followeeId = followeeId;
    }

    static async create(followerId, followeeId) {
        if (isNaN(followerId) || isNaN(followeeId)) {
            throw new Error('Validation failed for parameter. Invalid number.');
        }

        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('followerId', sql.Int, followerId)
                .input('followeeId', sql.Int, followeeId)
                .query(`
                    INSERT INTO Follow (FollowerId, FolloweeId)
                    VALUES (@followerId, @followeeId);
                    SELECT SCOPE_IDENTITY() AS id;
                `);
            return new Follow(result.recordset[0].id, followerId, followeeId);
        } catch (err) {
            throw new Error(`Error creating follow: ${err.message}`);
        }
    }

    static async delete(followerId, followeeId) {
        if (isNaN(followerId) || isNaN(followeeId)) {
            throw new Error('Validation failed for parameter. Invalid number.');
        }

        try {
            const pool = await sql.connect(dbConfig);
            await pool.request()
                .input('followerId', sql.Int, followerId)
                .input('followeeId', sql.Int, followeeId)
                .query('DELETE FROM Follow WHERE FollowerId = @followerId AND FolloweeId = @followeeId');
            return true;
        } catch (err) {
            throw new Error(`Error deleting follow: ${err.message}`);
        }
    }

    static async getFollowedDiscussions(userId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT d.*, u.name AS username, ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role, d.user_id
                    FROM Discussions d
                    JOIN Follow f ON f.FolloweeId = d.user_id
                    LEFT JOIN Users u ON d.user_id = u.id
                    LEFT JOIN ProfilePic p ON u.id = p.user_id
                    WHERE f.FollowerId = @userId
                    ORDER BY d.posted_date DESC
                `);
            return result.recordset.map(row => ({
                id: row.id,
                title: row.title,
                description: row.description,
                category: row.category,
                posted_date: row.posted_date,
                likes: row.likes,
                dislikes: row.dislikes,
                views: row.views,
                username: row.username,
                profilePic: row.profilePic,
                role: row.role,
                pinned: row.pinned,
                user_id: row.user_id // Ensure this is included
            }));
        } catch (err) {
            throw new Error(`Error getting followed discussions: ${err.message}`);
        }
    }
    

    static async isFollowing(followerId, followeeId) {
        try {
            const pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('followerId', sql.Int, followerId)
                .input('followeeId', sql.Int, followeeId)
                .query(`
                    SELECT 1 
                    FROM Follow 
                    WHERE FollowerId = @followerId AND FolloweeId = @followeeId
                `);
            return result.recordset.length > 0;
        } catch (err) {
            throw new Error(`Error checking follow status: ${err.message}`);
        }
    }
    
}
module.exports = Follow;
