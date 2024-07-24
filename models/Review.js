const sql = require('mssql');  // Importing the 'mssql' library for SQL Server operations
const dbConfig = require('../dbConfig'); // Importing database configuration

class Review { // Initializing the Review object with various properties
    constructor(review_id, review_text, rating, review_date, likes, dislikes, user_id, user_name, profilePic, role) {
        this.review_id = review_id;
        this.review_text = review_text;
        this.rating = rating;
        this.review_date = review_date;
        this.likes = likes;
        this.dislikes = dislikes;
        this.user_id = user_id;
        this.user_name = user_name;
        this.profilePic = profilePic;
        this.role = role;
    }

    // To get all reviews based on course ID, filter, and sort criteria
    static async getAllReviews(courseId, filter = 'all', sort = 'mostRecent') { // By default will show all reviews arranged by most recent

        const query = `
        SELECT ur.review_id, ur.review_text, ur.rating, ur.review_date, ur.likes, ur.dislikes, ur.user_id, u.name AS user_name, ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role
        FROM user_reviews ur
        JOIN Users u ON ur.user_id = u.id
        LEFT JOIN ProfilePic p ON u.id = p.user_id
        ${courseId && !isNaN(courseId) ? 'WHERE ur.course_id = @course_id' : 'WHERE 1=1'}
        ${filter !== 'all' ? 'AND ur.rating = @filter' : ''}
        ${sort === 'highestRating' ? 'ORDER BY ur.rating DESC' : sort === 'lowestRating' ? 'ORDER BY ur.rating ASC' : 'ORDER BY ur.review_date DESC'}
        `;

        // ** '${courseId && !isNaN(courseId) ? 'WHERE ur.course_id = @course_id' : 'WHERE 1=1'}' ---> if courseId exists, will have WHERE condition of 'ur.course_id = @course_id'. if courseId dont exist, then will 'WHERE 1=1'
        // ** 'WHERE 1=1' is just placeholder so that even when courseId dont exist, the filtering and sorting code below will still be carried out n applied

        let connection;
        try {
            connection = await sql.connect(dbConfig); // Establishing a connection to the database
            const request = connection.request();  // Create a new SQL request

            if (courseId && !isNaN(courseId)) {
                request.input('course_id', sql.Int, parseInt(courseId, 10)); // Add courseId parameter if courseId exists
            }

            if (filter !== 'all') {
                request.input('filter', sql.Int, filter); // Add filter parameter if provided
            }

            const result = await request.query(query); // Executing the SQL query
            return result.recordset.map(record => new Review(
                record.review_id,
                record.review_text,
                record.rating,
                record.review_date,
                record.likes,
                record.dislikes,
                record.user_id,
                record.user_name,
                record.profilePic,
                record.role
            ));

        } catch (err) {
            console.error('Error fetching reviews:', err.message);
            throw new Error('Error fetching reviews'); // Throw an error if fetching reviews fails

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }

    // To get review by review ID
    static async getReviewById(id) {

        const query = `
        SELECT ur.review_id, ur.review_text, ur.rating, ur.review_date, ur.likes, ur.dislikes, ur.user_id, u.name AS user_name, ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role
        FROM user_reviews ur
        JOIN Users u ON ur.user_id = u.id
        LEFT JOIN ProfilePic p ON u.id = p.user_id
        WHERE ur.review_id = @review_id
        `;

        let connection;
        try {
            connection = await sql.connect(dbConfig); // Establishing a connection to the database
            const request = new sql.Request(connection); // Create a new SQL request
            request.input('review_id', sql.Int, id); // Setting the input parameter for the query
            const result = await request.query(query); // Executing the SQL query
            const record = result.recordset[0]; // Getting the first record from the result set
            return new Review(
                record.review_id, 
                record.review_text, 
                record.rating, 
                record.review_date, 
                record.likes, 
                record.dislikes, 
                record.user_id, 
                record.user_name, 
                record.profilePic, 
                record.role
            );

        } catch (err) {
            console.error('Error fetching review:', err.message);
            throw new Error('Error fetching review'); // Throw an error if fetching the review fails

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }
    
    // To update review 
    static async updateReview(id, review_text, rating) {
        const query = `
        UPDATE user_reviews
        SET review_text = @review_text, rating = @rating
        WHERE review_id = @review_id
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig); // Establishing a connection to the database
            const request = new sql.Request(connection); // Create a new SQL request
            // Setting the input parameter for the query
            request.input('review_id', sql.Int, id);
            request.input('review_text', sql.NVarChar, review_text);
            request.input('rating', sql.Int, rating);
            const result = await request.query(query); // Executing the SQL query  
            if (result.rowsAffected[0] === 0) {
                throw new Error('Review not found or no changes made'); // Throw an error if no rows were affected
            }

            return await this.getReviewById(id); // Get the updated review
        
        } catch (err) {
            console.error('SQL error:', err.message);
            throw err; // Throw an error if the query fails

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }
        
    // To create a new review 
    static async createReview(userId, review_text, rating, courseId) {
        const query = `
        INSERT INTO user_reviews (user_id, review_text, rating, review_date, course_id)
        VALUES (@user_id, @review_text, @rating, GETDATE(), @course_id);
        SELECT SCOPE_IDENTITY() AS review_id;
         `;

        let connection;
        try {
            
            connection = await sql.connect(dbConfig); // Establishing a connection to the database
            const request = new sql.Request(connection); // Create a new SQL request
            // Setting the input parameter for the query
            request.input('user_id', sql.Int, userId);
            request.input('review_text', sql.NVarChar, review_text);
            request.input('rating', sql.Int, rating);
            request.input('course_id', sql.Int, courseId);
            const result = await request.query(query); // Executing the SQL query
            const reviewId = result.recordset[0].review_id; // Get the review ID of the newly created review
            return await this.getReviewById(reviewId) // Get the newly created review

        } catch (err) {
            console.error('SQL Error during review creation:', err); // Detailed SQL error logging
            throw new Error('Error creating review: ' + err.message); // Throw an error if creating the review fails

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }
        
    // To delete review 
    static async deleteReview(id) {
        const query = `
        DELETE FROM user_reviews
        WHERE review_id = @review_id
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig); // Establishing a connection to the database
            const request = new sql.Request(connection); // Create a new SQL request
            request.input('review_id', sql.Int, id); // Setting the input parameter for the query
            const result = await request.query(query);  // Executing the SQL query

            return result.rowsAffected > 0; // Return true if a row was deleted

        } catch (err) {
            console.error('Error executing delete query:', err.message);
            throw new Error('Error deleting review: ' + err.message); // Throw an error if deleting the review fails

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }
    
    // To get total count of reviews
    static async getReviewCount() {
        
        const query = `
        SELECT COUNT(*) AS count
        FROM user_reviews
        `;

        let connection;
        try {
            connection = await sql.connect(dbConfig); // Establishing a connection to the database
            const request = new sql.Request(connection); // Create a new SQL request
            const result = await request.query(query); // Executing the SQL query
            return result.recordset[0].count; // Return count of reviews

        } catch (err) {
            console.error(err);
            throw new Error('Error fetching review count'); // Throw an error if fetching the count fails

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }
    
    // To get count of reviews by course ID
    static async getReviewCountByCourseId(courseId) {

        const query = `
        SELECT COUNT(*) AS count
        FROM user_reviews
        WHERE course_id = @courseId
        `;

        let connection;
        try {
            connection = await sql.connect(dbConfig); // Establishing a connection to the database
            const request = new sql.Request(connection); // Create a new SQL request
            request.input('courseId', sql.Int, courseId); // Setting the input parameter for the query
            const result = await request.query(query); // Executing the SQL query
            return result.recordset[0].count; // Return the count of reviews by course ID

        } catch (err) {
            console.error(err);
            throw new Error('Error fetching review count by course ID'); // Throw an error if fetching the count fails

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }
    
    // To get count of reviews by user ID
    static async getReviewCountByUserId(userId) {

        const query = `
        SELECT COUNT(*) AS count
        FROM user_reviews
        WHERE user_id = @userId
        `;

        let connection;
        try {
            connection = await sql.connect(dbConfig); // Establishing a connection to the database
            const request = new sql.Request(connection); // Create a new SQL request
            request.input('userId', sql.Int, userId); // Setting the input parameter for the query
            const result = await request.query(query); // Executing the SQL query
            return result.recordset[0].count; // Return the count of reviews by user ID

        } catch (err) {
            console.error(err);
            throw new Error('Error fetching review count by user ID'); // Throw an error if fetching the count fails

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }
    
    // To increment the likes of a review
    static async incrementLikes(reviewId) { // UPDATE to increase like count, SELECT to retrieve the new like count
        
        const query = `
        UPDATE user_reviews 
        SET likes = likes + 1
        WHERE review_id = @reviewId;
        SELECT likes FROM user_reviews WHERE review_id = @reviewId;
        `;

        let connection;
        try {
            connection = await sql.connect(dbConfig); // Establishing a connection to the database
            const request = new sql.Request(connection); // Create a new SQL request
            request.input('reviewId', sql.Int, reviewId); // Setting the input parameter for the query
            const result = await request.query(query); // Executing the SQL query
            return result.recordset[0].likes; // Return the updated likes count

        } catch (err) {
            throw new Error(`Error incrementing likes: ${err.message}`); // Throw an error if incrementing likes fails

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }
    
    // To increment the dislikes of a review
    static async incrementDislikes(reviewId) {

        const query = `
        UPDATE user_reviews
        SET dislikes = dislikes + 1
        WHERE review_id = @reviewId;
        SELECT dislikes FROM user_reviews WHERE review_id = @reviewId;
        `;

        let connection;
        try {
            connection = await sql.connect(dbConfig); // Establishing a connection to the database
            const request = new sql.Request(connection); // Create a new SQL request
            request.input('reviewId', sql.Int, reviewId); // Setting the input parameter for the query
            const result = await request.query(query); // Executing the SQL query
            return result.recordset[0].dislikes; // Return the updated dislikes count

        } catch (err) {
            throw new Error(`Error incrementing dislikes: ${err.message}`); // Throw an error if incrementing dislikes fails

        } finally {
            if (connection) {
                await connection.close(); // Ensuring that the database connection is closed
            }
        }
    }            
}

module.exports = Review;  // Export the Review class
