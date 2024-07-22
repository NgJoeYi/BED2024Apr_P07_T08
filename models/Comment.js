const sql = require('mssql');
const dbConfig = require('../dbConfig');

class Comment {
    constructor(id, content, created_at, discussion_id, user_id, username, profilePic, role, likes, dislikes) {
        this.id = id;
        this.content = content;
        this.created_at = created_at;
        this.discussion_id = discussion_id;
        this.user_id = user_id;
        this.username = username;
        this.profilePic = profilePic;
        this.role = role;
        this.likes = likes;
        this.dislikes = dislikes;
    }

    static async getAllComments() {
        const query = `
            SELECT uc.id, uc.content, uc.created_at, uc.discussion_id, u.id AS user_id, u.name AS username,
                   ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role 
            FROM user_comments uc
            JOIN Users u ON uc.user_id = u.id
            LEFT JOIN ProfilePic p ON u.id = p.user_id
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const result = await connection.query(query);
            
            return result.recordset.map(row => new Comment( // do mapping so more organized, easier to work with also
                row.id, row.content, row.created_at, row.discussion_id, row.user_id, row.username, row.profilePic, row.role, row.likes, row.dislikes
            ));

            } catch (err) {
            throw new Error('Error fetching comments: ' + err.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    static async getCommentById(id) {
        const query = `
            SELECT uc.id, uc.content, uc.created_at, uc.discussion_id, uc.user_id, u.name AS username,
                   ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role 
            FROM user_comments uc
            JOIN Users u ON uc.user_id = u.id
            LEFT JOIN ProfilePic p ON u.id = p.user_id
            WHERE uc.id = @id
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('id', sql.Int, id);
            const result = await request.query(query);

            const record = result.recordset[0];
            return new Comment( // Can just return new Comment, don't need map because 'getCommentById' will only have 1 row of data given as response by db. But 'getAllComments' & 'getCommentsByDiscussionId' have > 1 row of arrays given as data response by db
                record.id, record.content, record.created_at, record.discussion_id, record.user_id, record.username, record.profilePic, record.role, record.likes, record.dislikes
            );

        } catch (err) {
            throw new Error('Error fetching comment: ' + err.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    static async getCommentsByDiscussionId(discussionId) {
        const query = `
            SELECT uc.id, uc.content, uc.created_at, uc.discussion_id, uc.likes, uc.dislikes, u.id AS user_id, u.name AS username,
                   ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role 
            FROM user_comments uc
            JOIN Users u ON uc.user_id = u.id
            LEFT JOIN ProfilePic p ON u.id = p.user_id
            WHERE uc.discussion_id = @discussionId
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('discussionId', sql.Int, discussionId);
            const result = await request.query(query);

            return result.recordset.map(row => new Comment(
                row.id, row.content, row.created_at, row.discussion_id, row.user_id, row.username, row.profilePic, row.role, row.likes, row.dislikes
            ));

        } catch (err) {
            throw new Error('Error fetching comments: ' + err.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    
    static async createComment(content, userId, discussion_id) {
        const query = `
            INSERT INTO user_comments (content, user_id, discussion_id, created_at)
            VALUES (@content, @userId, @discussion_id, GETDATE())
            SELECT SCOPE_IDENTITY() AS id;
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('content', sql.NVarChar, content);
            request.input('userId', sql.Int, userId);
            request.input('discussion_id', sql.Int, discussion_id);
            const result = await request.query(query);
            const commentId = result.recordset[0].id;

            return await this.getCommentById(commentId); // Aka will return instance of Comment class since getting details of new review created
        } catch (err) {
            throw new Error('Error creating comment: ' + err.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    static async updateComment(id, content) {
        const query = `
            UPDATE user_comments
            SET content = @content
            WHERE id = @id
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('id', sql.Int, id);
            request.input('content', sql.NVarChar, content);
            await request.query(query);

            return await this.getCommentById(id);
        } catch (err) {
            throw new Error('Error updating comment: ' + err.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    static async deleteComment(id) {
        const query = `
            DELETE FROM user_comments
            WHERE id = @id
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('id', sql.Int, id);
            const result = await request.query(query);

            return result.rowsAffected > 0;
        } catch (err) {
            throw new Error('Error deleting comment: ' + err.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async getCommentCount() {
        const query = `SELECT COUNT(*) AS count FROM user_comments`;
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            const result = await request.query(query);
            return result.recordset[0].count;
        } catch (err) {
            throw new Error('Error fetching comment count: ' + err.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async getCommentCountByDiscussionId(discussionId) {
        const query = `
            SELECT COUNT(*) AS count
            FROM user_comments
            WHERE discussion_id = @discussionId
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('discussionId', sql.Int, discussionId);
            const result = await request.query(query);
            return result.recordset[0].count;
        } catch (err) {
            throw new Error('Error fetching comment count by discussion ID: ' + err.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }   

    static async incrementLikes(id) { // UPDATE to increase like count, SELECT to retrieve the new like count
        const query = `
            UPDATE user_comments 
            SET likes = likes + 1
            WHERE id = @id;
            SELECT likes FROM user_comments WHERE id = @id;
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('id', sql.Int, id);
            const result = await request.query(query);
            return result.recordset[0].likes;
        } catch (err) {
            throw new Error('Error incrementing likes: ' + err.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async incrementDislikes(id) {
        const query = `
            UPDATE user_comments
            SET dislikes = dislikes + 1
            WHERE id = @id;
            SELECT dislikes FROM user_comments WHERE id = @id;
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('id', sql.Int, id);
            const result = await request.query(query);
            return result.recordset[0].dislikes;
        } catch (err) {
            throw new Error('Error incrementing dislikes: ' + err.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

module.exports = Comment;
