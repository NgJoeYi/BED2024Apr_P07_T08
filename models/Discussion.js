const sql = require('mssql'); // Import the mssql package for SQL Server database interaction
const dbConfig = require('../dbConfig'); // Import the database configuration
const Follow = require('./Follow'); // Import the Follow model

class Discussion {
    constructor(id, title, description, category, posted_date, likes, dislikes, views, username, profilePic, role, pinned) {
        this.id = id; // Initialize the discussion ID
        this.title = title; // Initialize the discussion title
        this.description = description; // Initialize the discussion description
        this.category = category; // Initialize the discussion category
        this.posted_date = posted_date; // Initialize the date the discussion was posted
        this.likes = likes; // Initialize the number of likes
        this.dislikes = dislikes; // Initialize the number of dislikes
        this.views = views; // Initialize the number of views
        this.username = username; // Initialize the username of the discussion creator
        this.profilePic = profilePic; // Initialize the profile picture of the discussion creator
        this.role = role; // Initialize the role of the discussion creator
        this.pinned = pinned; // Initialize whether the discussion is pinned
    }

    static async getDiscussions(userId, category, sort, search) {
        try {
            let query = `
                SELECT d.id, d.title, d.description, d.category, d.posted_date, d.likes, d.dislikes, d.views, u.name AS username, 
                       ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role, d.pinned, d.user_id,
                       CASE WHEN f.FollowerId IS NULL THEN 0 ELSE 1 END AS isFollowing
                FROM Discussions d
                LEFT JOIN Users u ON d.user_id = u.id
                LEFT JOIN ProfilePic p ON u.id = p.user_id
                LEFT JOIN Follow f ON d.user_id = f.FolloweeId AND (@userId IS NULL OR f.FollowerId = @userId)
                WHERE (@category = 'all' OR d.category = @category)
                AND (d.title LIKE '%' + @search + '%' OR d.description LIKE '%' + @search + '%')
                ORDER BY d.pinned DESC, d.posted_date DESC
            `;
            // SQL query to fetch discussions with details including user info and follow status

            const pool = await sql.connect(dbConfig); // Connect to the database using the configuration
            const request = pool.request(); // Create a new SQL request
            request.input('userId', sql.Int, userId); // Add the userId parameter to the request
            request.input('category', sql.NVarChar, category); // Add the category parameter to the request
            request.input('search', sql.NVarChar, search); // Add the search parameter to the request

            const result = await request.query(query); // Execute the query and store the result

            return result.recordset.map(row => ({
                id: row.id, // Map the discussion ID
                title: row.title, // Map the discussion title
                description: row.description, // Map the discussion description
                category: row.category, // Map the discussion category
                posted_date: row.posted_date, // Map the date the discussion was posted
                likes: row.likes, // Map the number of likes
                dislikes: row.dislikes, // Map the number of dislikes
                views: row.views, // Map the number of views
                username: row.username, // Map the username of the discussion creator
                profilePic: row.profilePic, // Map the profile picture of the discussion creator
                role: row.role, // Map the role of the discussion creator
                pinned: row.pinned, // Map whether the discussion is pinned
                user_id: row.user_id, // Map the user ID of the discussion creator
                isFollowing: row.isFollowing // Map whether the user is following the discussion creator
            }));
        } catch (err) {
            throw new Error(`Error getting discussions: ${err.message}`); // Handle errors by throwing a new error with a message
        }
    }


    static async getDiscussionById(discussionId) {
        try {
            const pool = await sql.connect(dbConfig); // Connect to the database using the configuration
            const result = await pool.request()
                .input('discussionId', sql.Int, discussionId) // Add the discussionId parameter to the request
                .query(`
                    SELECT d.*, u.name AS username, p.img AS profilePic
                    FROM Discussions d
                    JOIN Users u ON d.user_id = u.id
                    LEFT JOIN ProfilePic p ON u.id = p.user_id
                    WHERE d.id = @discussionId
                `); // Execute the query to get discussion details along with user info
            const row = result.recordset[0]; // Get the first row of the result
            return new Discussion(
                row.id, row.title, row.description, row.category, row.posted_date, row.likes, row.dislikes, row.views, row.username, row.profilePic, row.role, row.pinned
            ); // Create and return a new Discussion object
        } catch (err) {
            throw new Error(`Error fetching discussion details: ${err.message}`); // Handle errors by throwing a new error with a message
        }
    }


    static async createDiscussion(title, category, description, userId) {
        try {
            const posted_date = new Date(); // Get the current date and time

            const pool = await sql.connect(dbConfig); // Connect to the database using the configuration
            const result = await pool.request()
                .input('title', sql.NVarChar, title) // Add the title parameter to the request
                .input('description', sql.NVarChar, description) // Add the description parameter to the request
                .input('category', sql.NVarChar, category) // Add the category parameter to the request
                .input('posted_date', sql.DateTime, posted_date) // Add the posted_date parameter to the request
                .input('userId', sql.Int, userId) // Add the userId parameter to the request
                .query(`
                    INSERT INTO Discussions (title, description, category, posted_date, user_id, views, pinned)
                    VALUES (@title, @description, @category, @posted_date, @userId, 0, 0);
                    SELECT SCOPE_IDENTITY() AS id;
                `); // Execute the query to insert a new discussion and get the new discussion ID

            const discussionId = result.recordset[0].id; // Get the new discussion ID from the result
            const userResult = await pool.request()
                .input('userId', sql.Int, userId) // Add the userId parameter to the request
                .query(`
                    SELECT u.name, ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic
                    FROM Users u
                    LEFT JOIN ProfilePic p ON u.id = p.user_id
                    WHERE u.id = @userId
                `); // Execute the query to get user details

            const user = userResult.recordset[0]; // Get the user details from the result

            return new Discussion(
                discussionId, title, description, category, posted_date, 0, 0, 0, user.name, user.profilePic, user.role, false
            ); // Create and return a new Discussion object
        } catch (err) {
            throw new Error(`Error creating discussion: ${err.message}`); // Handle errors by throwing a new error with a message
        }
    }

   
    static async incrementLikes(discussionId, userId) {
        try {
            const pool = await sql.connect(dbConfig); // Connect to the database using the configuration

            // Fetch the current liked_by and disliked_by lists
            const result = await pool.request()
                .input('discussionId', sql.Int, discussionId) // Add the discussionId parameter to the request
                .query('SELECT likes, dislikes, liked_by, disliked_by FROM Discussions WHERE id = @discussionId');

            const discussion = result.recordset[0]; // Get the discussion details from the result
            if (!discussion) {
                throw new Error('Discussion not found'); // Handle case where discussion is not found
            }

            let { liked_by, disliked_by, likes, dislikes } = discussion;
            liked_by = liked_by ? liked_by.split(',').map(id => parseInt(id)) : []; // Parse liked_by list into an array
            disliked_by = disliked_by ? disliked_by.split(',').map(id => parseInt(id)) : []; // Parse disliked_by list into an array

            // Remove the user from the disliked_by list if they are there
            if (disliked_by.includes(userId)) {
                disliked_by = disliked_by.filter(id => id !== userId); // Remove user ID from disliked_by list
                dislikes -= 1; // Decrement dislikes count
            }

            // Add the user to the liked_by list if they are not already there
            if (!liked_by.includes(userId)) {
                liked_by.push(userId); // Add user ID to liked_by list
                likes += 1; // Increment likes count
            }

            // Update the liked_by and disliked_by columns
            await pool.request()
                .input('discussionId', sql.Int, discussionId) // Add the discussionId parameter to the request
                .input('likes', sql.Int, likes) // Add the likes parameter to the request
                .input('dislikes', sql.Int, dislikes) // Add the dislikes parameter to the request
                .input('liked_by', sql.NVarChar, liked_by.join(',')) // Add the liked_by parameter to the request
                .input('disliked_by', sql.NVarChar, disliked_by.join(',')) // Add the disliked_by parameter to the request
                .query('UPDATE Discussions SET likes = @likes, dislikes = @dislikes, liked_by = @liked_by, disliked_by = @disliked_by WHERE id = @discussionId'); // Execute the query to update the discussion

            return likes; // Return the updated likes count
        } catch (err) {
            throw new Error(`Error incrementing likes: ${err.message}`); // Handle errors by throwing a new error with a message
        }
    }


    static async incrementDislikes(discussionId, userId) {
        try {
            const pool = await sql.connect(dbConfig); // Connect to the database using the configuration

            // Fetch the current liked_by and disliked_by lists
            const result = await pool.request()
                .input('discussionId', sql.Int, discussionId) // Add the discussionId parameter to the request
                .query('SELECT likes, dislikes, liked_by, disliked_by FROM Discussions WHERE id = @discussionId');

            const discussion = result.recordset[0]; // Get the discussion details from the result
            if (!discussion) {
                throw new Error('Discussion not found'); // Handle case where discussion is not found
            }

            let { liked_by, disliked_by, likes, dislikes } = discussion;
            liked_by = liked_by ? liked_by.split(',').map(id => parseInt(id)) : []; // Parse liked_by list into an array
            disliked_by = disliked_by ? disliked_by.split(',').map(id => parseInt(id)) : []; // Parse disliked_by list into an array

            // Remove the user from the liked_by list if they are there
            if (liked_by.includes(userId)) {
                liked_by = liked_by.filter(id => id !== userId); // Remove user ID from liked_by list
                likes -= 1; // Decrement likes count
            }

            // Add the user to the disliked_by list if they are not already there
            if (!disliked_by.includes(userId)) {
                disliked_by.push(userId); // Add user ID to disliked_by list
                dislikes += 1; // Increment dislikes count
            }

            // Update the liked_by and disliked_by columns
            await pool.request()
                .input('discussionId', sql.Int, discussionId) // Add the discussionId parameter to the request
                .input('likes', sql.Int, likes) // Add the likes parameter to the request
                .input('dislikes', sql.Int, dislikes) // Add the dislikes parameter to the request
                .input('liked_by', sql.NVarChar, liked_by.join(',')) // Add the liked_by parameter to the request
                .input('disliked_by', sql.NVarChar, disliked_by.join(',')) // Add the disliked_by parameter to the request
                .query('UPDATE Discussions SET likes = @likes, dislikes = @dislikes, liked_by = @liked_by, disliked_by = @disliked_by WHERE id = @discussionId'); // Execute the query to update the discussion

            return dislikes; // Return the updated dislikes count
        } catch (err) {
            throw new Error(`Error incrementing dislikes: ${err.message}`); // Handle errors by throwing a new error with a message
        }
    }


    static async incrementViews(discussionId) {
        try {
            const pool = await sql.connect(dbConfig); // Connect to the database using the configuration
            await pool.request()
                .input('discussionId', sql.Int, discussionId) // Add the discussionId parameter to the request
                .query('UPDATE Discussions SET views = views + 1 WHERE id = @discussionId'); // Execute the query to increment views

            const result = await pool.request()
                .input('discussionId', sql.Int, discussionId) // Add the discussionId parameter to the request
                .query('SELECT views FROM Discussions WHERE id = @discussionId'); // Execute the query to get the updated views count

            return result.recordset[0].views; // Return the updated views count
        } catch (err) {
            throw new Error(`Error incrementing views: ${err.message}`); // Handle errors by throwing a new error with a message
        }
    }


    static async getDiscussionsByUser(userId) {
        try {
            const pool = await sql.connect(dbConfig); // Connect to the database using the configuration
            const result = await pool.request()
                .input('userId', sql.Int, userId) // Add the userId parameter to the request
                .query(`
                    SELECT d.id, d.title, d.description, d.category, d.posted_date, d.likes, d.dislikes, d.views, u.name AS username, p.img AS profilePic, d.pinned
                    FROM Discussions d
                    LEFT JOIN Users u ON d.user_id = u.id
                    LEFT JOIN ProfilePic p ON u.id = p.user_id
                    WHERE d.user_id = @userId
                    ORDER BY d.posted_date DESC
                `); // Execute the query to get discussions by user
            return result.recordset.map(row => new Discussion(
                row.id, row.title, row.description, row.category, row.posted_date, row.likes, row.dislikes, row.views, row.username, row.profilePic, row.role, row.pinned
            )); // Map the result to Discussion objects and return the array
        } catch (err) {
            throw new Error(`Error getting user discussions: ${err.message}`); // Handle errors by throwing a new error with a message
        }
    }


    static async updateDiscussion(discussionId, description, category, userId) {
        try {
            const pool = await sql.connect(dbConfig); // Connect to the database using the configuration
            const result = await pool.request()
                .input('discussionId', sql.Int, discussionId) // Add the discussionId parameter to the request
                .input('description', sql.NVarChar, description) // Add the description parameter to the request
                .input('category', sql.NVarChar, category) // Add the category parameter to the request
                .input('userId', sql.Int, userId) // Add the userId parameter to the request
                .query(`
                    UPDATE Discussions
                    SET description = @description, category = @category
                    WHERE id = @discussionId AND user_id = @userId
                `); // Execute the query to update the discussion

            return result.rowsAffected[0] > 0; // Return true if rows were affected, otherwise false
        } catch (err) {
            throw new Error(`Error updating discussion: ${err.message}`); // Handle errors by throwing a new error with a message
        }
    }


    static async deleteDiscussion(discussionId, userId) {
        try {
            const pool = await sql.connect(dbConfig); // Connect to the database using the configuration
            await pool.request()
                .input('discussionId', sql.Int, discussionId) // Add the discussionId parameter to the request
                .input('userId', sql.Int, userId) // Add the userId parameter to the request
                .query('DELETE FROM Discussions WHERE id = @discussionId AND user_id = @userId'); // Execute the query to delete the discussion
            return true; // Return true indicating successful deletion
        } catch (err) {
            throw new Error(`Error deleting discussion: ${err.message}`); // Handle errors by throwing a new error with a message
        }
    }


    static async updateDiscussionPin(discussionId, pinned) {
        try {
            const pool = await sql.connect(dbConfig); // Connect to the database using the configuration
            await pool.request()
                .input('discussionId', sql.Int, discussionId) // Add the discussionId parameter to the request
                .input('pinned', sql.Bit, pinned) // Add the pinned parameter to the request
                .query('UPDATE Discussions SET pinned = @pinned WHERE id = @discussionId'); // Execute the query to update the pinned status
            return true; // Return true indicating successful update
        } catch (err) {
            throw new Error(`Error updating discussion pin: ${err.message}`); // Handle errors by throwing a new error with a message
        }
    }


    static async getDiscussionsWithFollowStatus(userId, category = 'all', sort = 'most-recent', search = '') {
        try {
            let query = `
                SELECT d.*, u.name AS username, ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role,
                CASE WHEN f.FollowerId IS NULL THEN 0 ELSE 1 END AS isFollowing
                FROM Discussions d
                LEFT JOIN Users u ON d.user_id = u.id
                LEFT JOIN ProfilePic p ON u.id = p.user_id
                LEFT JOIN Follow f ON d.user_id = f.FolloweeId AND f.FollowerId = @userId
                WHERE (@category = 'all' OR d.category = @category)
                AND (d.title LIKE '%' + @search + '%' OR d.description LIKE '%' + @search + '%')
                ORDER BY d.pinned DESC, d.posted_date DESC
            `;
            // SQL query to fetch discussions with details including user info and follow status

            const pool = await sql.connect(dbConfig); // Connect to the database using the configuration
            const result = await pool.request()
                .input('userId', sql.Int, userId) // Add the userId parameter to the request
                .input('category', sql.NVarChar, category) // Add the category parameter to the request
                .input('search', sql.NVarChar, search) // Add the search parameter to the request
                .query(query); // Execute the query and store the result

            return result.recordset; // Return the recordset
        } catch (err) {
            throw new Error(`Error getting discussions: ${err.message}`); // Handle errors by throwing a new error with a message
        }
    }
}



module.exports = Discussion;
