const sql = require('mssql'); // Importing the 'mssql' library for SQL Server operations
const dbConfig = require('../dbConfig'); // Importing database configuration

class Comment { // Initializing the Comment object with various properties
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

    // Function to fetch all comments
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
            connection = await sql.connect(dbConfig);  // Establishing a connection to the database
            const request = new sql.Request(connection);
            const result = await request.query(query); // Executing the SQL query

            if (!result || !result.recordset || result.recordset.length === 0) { // Handle cases when recordset is null, undefined, or empty
                return []; // Return an empty array if no comments are found
            }
            
            return result.recordset.map(row => new Comment( // Mapping result rows to instances of Comment class so more organized, easier to work with also
                row.id, row.content, row.created_at, row.discussion_id, row.user_id, row.username, row.profilePic, row.role, row.likes, row.dislikes
            ));

            } catch (err) { // Handling any errors that occur during the process
                throw new Error('Error fetching comments: ' + err.message);

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }
    
    // Function to fetch comments by user ID
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
            connection = await sql.connect(dbConfig); // Establishing a connection to the database
            const request = new sql.Request(connection);
            request.input('id', sql.Int, id); // Setting the input parameter for the query
            const result = await request.query(query); // Executing the SQL query

            const record = result.recordset[0]; // Getting the first record from the result set
            return new Comment( // Can just return new Comment, don't need map because 'getCommentById' will only have 1 row of data given as response by db. But 'getAllComments' & 'getCommentsByDiscussionId' have > 1 row of arrays given as data response by db
                record.id, record.content, record.created_at, record.discussion_id, record.user_id, record.username, record.profilePic, record.role, record.likes, record.dislikes
            );

        } catch (err) { // Handling any errors that occur during the process
            throw new Error('Error fetching comment: ' + err.message);

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }
    
    // Function to fetch comments by discussion ID
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
            connection = await sql.connect(dbConfig); // Establishing a connection to the database
            const request = new sql.Request(connection);
            request.input('discussionId', sql.Int, discussionId); // Setting the input parameter for the query
            const result = await request.query(query); // Executing the SQL query

            if (!result || !result.recordset || result.recordset.length === 0) { // Handle cases when recordset is null, undefined, or empty
                return []; // Return an empty array if no comments are found
            }

            // Mapping the result rows to instances of the Comment class
            return result.recordset.map(row => new Comment(
                row.id, row.content, row.created_at, row.discussion_id, row.user_id, row.username, row.profilePic, row.role, row.likes, row.dislikes
            ));

        } catch (err) { // Handling any errors that occur during the process
            throw new Error('Error fetching comments: ' + err.message);

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }

    // Function to create a new comment
    static async createComment(content, userId, discussion_id) {
        const query = `
            INSERT INTO user_comments (content, user_id, discussion_id, created_at)
            VALUES (@content, @userId, @discussion_id, GETDATE())
            SELECT SCOPE_IDENTITY() AS id;
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig);  // Establishing a connection to the database
            const request = new sql.Request(connection);

            // Setting the input parameters for the query
            request.input('content', sql.NVarChar, content);
            request.input('userId', sql.Int, userId);
            request.input('discussion_id', sql.Int, discussion_id);

            // Executing the SQL query to insert the comment and retrieve its ID
            const result = await request.query(query);
            const commentId = result.recordset[0].id;

            return await this.getCommentById(commentId); // Aka will return instance of Comment class since getting details of new review created
        } catch (err) { // Handling any errors that occur during the process
            throw new Error('Error creating comment: ' + err.message);

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }
    
    // Function to update comment
    static async updateComment(id, content) {
        const query = `
            UPDATE user_comments
            SET content = @content
            WHERE id = @id
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig); // Establishing a connection to the database
            const request = new sql.Request(connection);

            // Setting the input parameters for the query
            request.input('id', sql.Int, id);
            request.input('content', sql.NVarChar, content);

            const result = await request.query(query); // Executing the SQL query to update the comment

            if (!result || !result.rowsAffected || result.rowsAffected[0] === 0) {
                throw new Error('Update failed, comment not found.');
            }

            return await this.getCommentById(id); // Fetching and returning the updated comment
            
        } catch (err) { // Handling any errors that occur during the process
            throw new Error('Error updating comment: ' + err.message);

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }
    
    
    // Function to delete comment
    static async deleteComment(id) {
        const query = `
            DELETE FROM user_comments
            WHERE id = @id
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig); // Establishing a connection to the database
            const request = new sql.Request(connection);
            request.input('id', sql.Int, id); // Setting the input parameter for the query
            const result = await request.query(query); // Executing the SQL query to delete the comment

            if (!result || !result.rowsAffected || result.rowsAffected[0] === 0) {
                throw new Error('Delete failed, comment not found.');
            }

            return result.rowsAffected > 0; // Return true if a row was deleted

        } catch (err) { // Handling any errors that occur during the process
            throw new Error('Error deleting comment: ' + err.message);

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }

    // Function to fetch total count of comments
    static async getCommentCount() {
        const query = `SELECT COUNT(*) AS count FROM user_comments`;
        let connection;
        try {
            connection = await sql.connect(dbConfig); // Establishing a connection to the database
            const request = new sql.Request(connection);
            const result = await request.query(query); // Executing the SQL query to get the total comment count
            return result.recordset[0].count; // Returning count of comments

        } catch (err) { // Handling any errors that occur during the process
            throw new Error('Error fetching comment count: ' + err.message);

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }

    // Function to fetch the count of comments by discussion ID
    static async getCommentCountByDiscussionId(discussionId) {
        const query = `
            SELECT COUNT(*) AS count
            FROM user_comments
            WHERE discussion_id = @discussionId
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig); // Establishing a connection to the database
            const request = new sql.Request(connection);
            request.input('discussionId', sql.Int, discussionId); // Setting the input parameter for the query
            const result = await request.query(query); // Executing the SQL query to get the count of comments for a specific discussion
            return result.recordset[0].count; // Returning count of comments

        } catch (err) { // Handling any errors that occur during the process
            throw new Error('Error fetching comment count by discussion ID: ' + err.message);

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }   

    static async incrementLikes(commentId, userId) {
        const query = `
            IF EXISTS (SELECT 1 FROM CommentLikes WHERE comment_id = @commentId AND user_id = @userId)
            BEGIN
                DELETE FROM CommentLikes WHERE comment_id = @commentId AND user_id = @userId;
                UPDATE user_comments SET likes = likes - 1 WHERE id = @commentId;
                SELECT 'Like successfully removed' AS message, (SELECT likes FROM user_comments WHERE id = @commentId) AS likes;
            END
            ELSE
            BEGIN
                IF EXISTS (SELECT 1 FROM CommentDislikes WHERE comment_id = @commentId AND user_id = @userId)
                BEGIN
                    DELETE FROM CommentDislikes WHERE comment_id = @commentId AND user_id = @userId;
                    UPDATE user_comments SET dislikes = dislikes - 1 WHERE id = @commentId;
                END
                INSERT INTO CommentLikes (comment_id, user_id) VALUES (@commentId, @userId);
                UPDATE user_comments SET likes = likes + 1 WHERE id = @commentId;
                SELECT 'Like successfully added' AS message, (SELECT likes FROM user_comments WHERE id = @commentId) AS likes;
            END
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('commentId', sql.Int, commentId);
            request.input('userId', sql.Int, userId);
            const result = await request.query(query);
            return result.recordset[0];
        } catch (err) {
            throw new Error('Error toggling like: ' + err.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async incrementDislikes(commentId, userId) {
        const query = `
            IF EXISTS (SELECT 1 FROM CommentDislikes WHERE comment_id = @commentId AND user_id = @userId)
            BEGIN
                DELETE FROM CommentDislikes WHERE comment_id = @commentId AND user_id = @userId;
                UPDATE user_comments SET dislikes = dislikes - 1 WHERE id = @commentId;
                SELECT 'Dislike successfully removed' AS message, (SELECT dislikes FROM user_comments WHERE id = @commentId) AS dislikes;
            END
            ELSE
            BEGIN
                IF EXISTS (SELECT 1 FROM CommentLikes WHERE comment_id = @commentId AND user_id = @userId)
                BEGIN
                    DELETE FROM CommentLikes WHERE comment_id = @commentId AND user_id = @userId;
                    UPDATE user_comments SET likes = likes - 1 WHERE id = @commentId;
                END
                INSERT INTO CommentDislikes (comment_id, user_id) VALUES (@commentId, @userId);
                UPDATE user_comments SET dislikes = dislikes + 1 WHERE id = @commentId;
                SELECT 'Dislike successfully added' AS message, (SELECT dislikes FROM user_comments WHERE id = @commentId) AS dislikes;
            END
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('commentId', sql.Int, commentId);
            request.input('userId', sql.Int, userId);
            const result = await request.query(query);
            return result.recordset[0];
        } catch (err) {
            throw new Error('Error toggling dislike: ' + err.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

module.exports = Comment; // Exporting the Comment class
