const sql = require('mssql');
const dbConfig = require('../dbConfig');

class Review {
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

    static async getAllReviews(courseId, filter = 'all', sort = 'mostRecent') {

        const query = `
        SELECT ur.review_id, ur.review_text, ur.rating, ur.review_date, ur.likes, ur.dislikes, ur.user_id, u.name AS user_name, ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role
        FROM user_reviews ur
        JOIN Users u ON ur.user_id = u.id
        LEFT JOIN ProfilePic p ON u.id = p.user_id
        ${courseId && !isNaN(courseId) ? 'WHERE ur.course_id = @course_id' : 'WHERE 1=1'}
        ${filter !== 'all' ? 'AND ur.rating = @filter' : ''}
        ${sort === 'highestRating' ? 'ORDER BY ur.rating DESC' : sort === 'lowestRating' ? 'ORDER BY ur.rating ASC' : 'ORDER BY ur.review_date DESC'}
        `;

        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = connection.request();

            if (courseId && !isNaN(courseId)) {
                request.input('course_id', sql.Int, parseInt(courseId, 10));
            }

            if (filter !== 'all') {
                request.input('filter', sql.Int, filter);
            }

            const result = await request.query(query);
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
            throw new Error('Error fetching reviews');
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    
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
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('review_id', sql.Int, id);
            const result = await request.query(query);
            const record = result.recordset[0];
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
            throw new Error('Error fetching review');
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    static async updateReview(id, review_text, rating, courseId) {
        const query = `
        UPDATE user_reviews
        SET review_text = @review_text, rating = @rating, course_id = @course_id
        WHERE review_id = @review_id
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('review_id', sql.Int, id);
            request.input('review_text', sql.NVarChar, review_text);
            request.input('rating', sql.Int, rating);
            request.input('course_id', sql.Int, courseId);
            const result = await request.query(query);    
            if (result.rowsAffected[0] === 0) {
                throw new Error('Review not found or no changes made');
            }

            return await this.getReviewById(id);
        
        } catch (err) {
            console.error('SQL error:', err.message);
            throw err;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
        
    static async createReview(userId, review_text, rating, courseId) {
        const query = `
        INSERT INTO user_reviews (user_id, review_text, rating, review_date, course_id)
        VALUES (@user_id, @review_text, @rating, GETDATE(), @course_id);
        SELECT SCOPE_IDENTITY() AS review_id;
         `;
        let connection;
        try {
            
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('user_id', sql.Int, userId);
            request.input('review_text', sql.NVarChar, review_text);
            request.input('rating', sql.Int, rating);
            request.input('course_id', sql.Int, courseId);
            const result = await request.query(query);
            const reviewId = result.recordset[0].review_id;
            return await this.getReviewById(reviewId)

        } catch (err) {
            console.error('SQL Error during review creation:', err); // Detailed SQL error logging
            throw new Error('Error creating review: ' + err.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
        
    static async deleteReview(id) {
        const query = `
        DELETE FROM user_reviews
        WHERE review_id = @review_id
        `;
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('review_id', sql.Int, id);
            const result = await request.query(query);

            return result.rowsAffected > 0;
        } catch (err) {
            console.error('Error executing delete query:', err.message);
            throw new Error('Error deleting review: ' + err.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    
    static async getReviewCount(courseId) {
        
        const query = `
        SELECT COUNT(*) AS count
        FROM user_reviews
        ${courseId ? 'WHERE course_id = @courseId' : ''}
        `;

        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('courseId', sql.Int, courseId);
            const result = await request.query(query);
            return result.recordset[0].count;
        } catch (err) {
            console.error(err);
            throw new Error('Error fetching review count');
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    static async getReviewCountByCourseId(courseId) {

        const query = `
        SELECT COUNT(*) AS count
        FROM user_reviews
        WHERE course_id = @courseId
        `;

        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('courseId', sql.Int, courseId);
            const result = await request.query(query);
            return result.recordset[0].count;
        } catch (err) {
            console.error(err);
            throw new Error('Error fetching review count by course ID');
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    static async getReviewCountByUserId(userId) {

        const query = `
        SELECT COUNT(*) AS count
        FROM user_reviews
        WHERE user_id = @userId
        `;

        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('userId', sql.Int, userId);
            const result = await request.query(query);
            return result.recordset[0].count;
        } catch (err) {
            console.error(err);
            throw new Error('Error fetching review count by user ID');
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    static async incrementLikes(reviewId) {
        
        const query = `
        UPDATE user_reviews 
        SET likes = likes + 1
        WHERE review_id = @reviewId;
        SELECT likes FROM user_reviews WHERE review_id = @reviewId;
        `;

        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('reviewId', sql.Int, reviewId);
            const result = await request.query(query);
            return result.recordset[0].likes;
        } catch (err) {
            throw new Error(`Error incrementing likes: ${err.message}`);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    static async incrementDislikes(reviewId) {

        const query = `
        UPDATE user_reviews
        SET dislikes = dislikes + 1
        WHERE review_id = @reviewId;
        SELECT dislikes FROM user_reviews WHERE review_id = @reviewId;
        `;

        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const request = new sql.Request(connection);
            request.input('reviewId', sql.Int, reviewId);
            const result = await request.query(query);
            return result.recordset[0].dislikes;
        } catch (err) {
            throw new Error(`Error incrementing dislikes: ${err.message}`);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }            
}

module.exports = Review;
