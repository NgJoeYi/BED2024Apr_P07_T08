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
        let connection;
        try {
            connection = await sql.connect(dbConfig);

            let query = `
                SELECT ur.review_id, ur.review_text, ur.rating, ur.review_date, ur.likes, ur.dislikes, ur.user_id, u.name AS user_name, ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role
                FROM user_reviews ur
                JOIN Users u ON ur.user_id = u.id
                LEFT JOIN ProfilePic p ON u.id = p.user_id
            `;

            if (courseId && !isNaN(courseId)) {
                query += ` WHERE ur.course_id = @course_id `;
            } else {
                query += ` WHERE 1=1 `;
            }

            if (filter !== 'all') {
                query += ` AND ur.rating = @filter `;
            }

            if (sort === 'highestRating') {
                query += ` ORDER BY ur.rating DESC `;
            } else if (sort === 'lowestRating') {
                query += ` ORDER BY ur.rating ASC `;
            } else {
                query += ` ORDER BY ur.review_date DESC `;
            }

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
        let connection;
        try {
            const connection = await sql.connect(dbConfig);
            const result = await connection.request()
                .input('review_id', sql.Int, id)
                .query(`
                    SELECT ur.review_id, ur.review_text, ur.rating, ur.review_date, ur.likes, ur.dislikes, ur.user_id, u.name AS user_name, ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role
                    FROM user_reviews ur
                    JOIN Users u ON ur.user_id = u.id
                    LEFT JOIN ProfilePic p ON u.id = p.user_id
                    WHERE ur.review_id = @review_id
                `);
            // return result.recordset[0];

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
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const result = await connection.request()
                .input('review_id', sql.Int, id) // Correctly declare the variable here
                .input('review_text', sql.NVarChar, review_text)
                .input('rating', sql.Int, rating)
                .input('course_id', sql.Int, courseId)
                .query(`
                    UPDATE user_reviews
                    SET review_text = @review_text, rating = @rating, course_id = @course_id
                    WHERE review_id = @review_id
                `);
    
            if (result.rowsAffected[0] === 0) {
                throw new Error('Review not found or no changes made');
            }
    
            const updatedReview = await connection.request()
                .input('review_id', sql.Int, id)
                .query(`
                    SELECT ur.review_id, ur.review_text, ur.rating, ur.review_date, ur.likes, ur.dislikes, ur.user_id, u.name AS user_name, ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role
                    FROM user_reviews ur
                    JOIN Users u ON ur.user_id = u.id
                    LEFT JOIN ProfilePic p ON u.id = p.user_id
                    WHERE ur.review_id = @review_id
                `);
    
            const record = updatedReview.recordset[0];
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
            console.error('SQL error:', err.message);
            throw err;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
        
    static async createReview(userId, review_text, rating, courseId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const result = await connection.request()
                .input('user_id', sql.Int, userId)
                .input('review_text', sql.NVarChar, review_text)
                .input('rating', sql.Int, rating)
                .input('course_id', sql.Int, courseId)
                .query(`
                    INSERT INTO user_reviews (user_id, review_text, rating, review_date, course_id)
                    VALUES (@user_id, @review_text, @rating, GETDATE(), @course_id);
                    SELECT SCOPE_IDENTITY() AS review_id;
                `);
    
            const reviewId = result.recordset[0].review_id;
            const reviewResult = await connection.request()
                .input('review_id', sql.Int, reviewId)
                .query(`
                    SELECT ur.review_id, ur.review_text, ur.rating, ur.review_date, ur.likes, ur.dislikes, ur.user_id, u.name AS user_name, ISNULL(p.img, 'images/profilePic.jpeg') AS profilePic, u.role
                    FROM user_reviews ur
                    JOIN Users u ON ur.user_id = u.id
                    LEFT JOIN ProfilePic p ON u.id = p.user_id
                    WHERE ur.review_id = @review_id
                `);
    
            const record = reviewResult.recordset[0];
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
            console.error('SQL Error during review creation:', err); // Detailed SQL error logging
            throw new Error('Error creating review: ' + err.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
        
    static async deleteReview(id) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            await connection.request()
                .input('review_id', sql.Int, id)
                .query(`
                    DELETE FROM user_reviews
                    WHERE review_id = @review_id
                `);
            console.log('Review deleted successfully for ID:', id);
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
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            let countQuery = `SELECT COUNT(*) AS count FROM user_reviews`;
            if (courseId) {
                countQuery += ` WHERE course_id = @courseId`;
            }
            const request = new sql.Request(connection);
            if (courseId) {
                request.input('courseId', sql.Int, courseId);
            }
            const result = await request.query(countQuery);
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
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const query = `
                SELECT COUNT(*) AS count
                FROM user_reviews
                WHERE course_id = @courseId
            `;
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
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const query = `
                SELECT COUNT(*) AS count
                FROM user_reviews
                WHERE user_id = @userId
            `;
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
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            await connection.request()
                .input('reviewId', sql.Int, reviewId)
                .query('UPDATE user_reviews SET likes = likes + 1 WHERE review_id = @reviewId');
    
            const result = await connection.request()
                .input('reviewId', sql.Int, reviewId)
                .query('SELECT likes FROM user_reviews WHERE review_id = @reviewId');
    
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
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            await connection.request()
                .input('reviewId', sql.Int, reviewId)
                .query('UPDATE user_reviews SET dislikes = dislikes + 1 WHERE review_id = @reviewId');
    
            const result = await connection.request()
                .input('reviewId', sql.Int, reviewId)
                .query('SELECT dislikes FROM user_reviews WHERE review_id = @reviewId');
    
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
