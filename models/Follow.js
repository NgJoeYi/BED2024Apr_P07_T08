const sql = require('mssql'); // Import the mssql library for database operations
const dbConfig = require('../dbConfig'); // Import the database configuration

class Follow {
    constructor(id, followerId, followeeId) {
        this.id = id; // Initialize the follow ID
        this.followerId = followerId; // Initialize the follower ID
        this.followeeId = followeeId; // Initialize the followee ID
    }

    // usage of static - the method is within a class
    // async function - indicating that it can perform asynchronous operations and can be used with await to wait for promises to resolve.


    // Create a new follow relationship
    static async create(followerId, followeeId) {
        //NaN - not a number
        if (isNaN(followerId) || isNaN(followeeId)) {  // to check if the both id is valid numbers 
            throw new Error('Validation failed for parameter. Invalid number.'); // if return as not a number it will return true and show this Error
            // the execution of the method will stop, and the error will be propagated to where the method was called
        }

        try {
            const pool = await sql.connect(dbConfig); // Connect to the database, asynchronous function returns connection pools - used to make database request 
            const result = await pool.request() //a new request using the connection pool.
                .input('followerId', sql.Int, followerId) // Add follower ID parameter
                .input('followeeId', sql.Int, followeeId) // Add followee ID parameter
                .query(`
                    INSERT INTO Follow (FollowerId, FolloweeId)
                    VALUES (@followerId, @followeeId);
                    SELECT SCOPE_IDENTITY() AS id;
                `); // Insert follow relationship and return the new ID
                // scope identity - query retrieves the last inserted identity value in the current scope, which is the ID of the newly created follow relationship.
            return new Follow(result.recordset[0].id, followerId, followeeId); // result of the query is stored in the result variable, 
            //recordset property contains the rows returned by the query. In this case, it contains a single row with the new ID (id).
            // return the follow class with the initialized IDs
        } catch (err) {
            throw new Error(`Error creating follow: ${err.message}`);
        }
    }

    // Delete an existing follow relationship
    static async delete(followerId, followeeId) {
        if (isNaN(followerId) || isNaN(followeeId)) {  // to check if the both id is valid numbers 
            throw new Error('Validation failed for parameter. Invalid number.'); // if return as not a number it will return true and show this Error
            // the execution of the method will stop, and the error will be propagated to where the method was called
        }

        try {
            const pool = await sql.connect(dbConfig);  // Connect to the database, asynchronous function returns connection pools - used to make database request 
            await pool.request()
                .input('followerId', sql.Int, followerId) // Add follower ID parameter
                .input('followeeId', sql.Int, followeeId) // Add followee ID parameter
                .query('DELETE FROM Follow WHERE FollowerId = @followerId AND FolloweeId = @followeeId'); // Delete follow relationship
            return true; // Return true if successful
        } catch (err) {
            throw new Error(`Error deleting follow: ${err.message}`);
        }
    }

    // Check if a user is following another user
    static async isFollowing(followerId, followeeId) {
        try {
            const pool = await sql.connect(dbConfig); // Connect to the database
            const result = await pool.request()
                .input('followerId', sql.Int, followerId) // Add follower ID parameter
                .input('followeeId', sql.Int, followeeId) // Add followee ID parameter
                .query(`
                    SELECT 1 
                    FROM Follow 
                    WHERE FollowerId = @followerId AND FolloweeId = @followeeId
                `); // Check if follow relationship exists
            return result.recordset.length > 0; // Return true if relationship exists
        } catch (err) {
            throw new Error(`Error checking follow status: ${err.message}`);
        }
    }

    // Get the count of users that a user is following
    static async getFollowingCount(userId) {
        try {
            const pool = await sql.connect(dbConfig); // Connect to the database
            const result = await pool.request()
                .input('userId', sql.Int, userId) // Add user ID parameter
                .query('SELECT COUNT(*) AS count FROM Follow WHERE FollowerId = @userId'); // Get the count of following users
            
            return result.recordset[0].count; // Return the count
        } catch (err) {
            throw new Error(`Error getting following count: ${err.message}`);
        }
    }

    // Get the count of users that are following a user
    static async getFollowerCount(userId) {
        try {
            const pool = await sql.connect(dbConfig); // Connect to the database
            const result = await pool.request()
                .input('userId', sql.Int, userId) // Add user ID parameter
                .query('SELECT COUNT(*) AS count FROM Follow WHERE FolloweeId = @userId'); // Get the count of followers
            
            return result.recordset[0].count; // Return the count
        } catch (err) {
            throw new Error(`Error getting follower count: ${err.message}`);
        }
    }

    // Get discussions from users that the logged-in user follows
    static async getFollowedDiscussions(userId) {
        try {
            const pool = await sql.connect(dbConfig); // Connect to the database
            const result = await pool.request()
                .input('userId', sql.Int, userId) // Add user ID parameter
                .query(`
                    SELECT d.*, u.name AS username, ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role, d.user_id,
                           CASE WHEN f2.FollowerId IS NOT NULL THEN 1 ELSE 0 END AS isFollowing
                    FROM Discussions d
                    JOIN Follow f ON f.FolloweeId = d.user_id
                    LEFT JOIN Users u ON d.user_id = u.id
                    LEFT JOIN ProfilePic p ON u.id = p.user_id
                    LEFT JOIN Follow f2 ON f2.FolloweeId = d.user_id AND f2.FollowerId = @userId
                    WHERE f.FollowerId = @userId
                    ORDER BY d.posted_date DESC
                `); // Get followed discussions
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
                user_id: row.user_id,
                isFollowing: row.isFollowing // Include follow status
            })); // Map the result to a more readable format
        } catch (err) {
            throw new Error(`Error getting followed discussions: ${err.message}`);
        }
    }
}

module.exports = Follow; // Export the Follow model
