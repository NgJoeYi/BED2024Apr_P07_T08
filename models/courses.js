const sql = require('mssql');
const dbConfig = require('../dbConfig');

class Courses {
    constructor(courseID, userID, title, description, category, level, duration, createdAt, courseImage) {
        this.courseID = courseID;
        this.userID = userID;
        this.title = title;
        this.description = description;
        this.category = category;
        this.level = level;
        this.duration = duration;
        this.createdAt = createdAt;
        this.courseImage = courseImage;
    }

    static async getAllCourses() {
        let pool;
        try {
            pool = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Courses`;
            const result = await pool.request().query(sqlQuery);
            return result.recordset.map(row => new Courses(row.CourseID, row.UserID, row.Title, row.Description, row.Category, row.Level, row.Duration, row.CreatedAt, row.CourseImage));
        } catch (error) {
            console.error('Error retrieving courses:', error);
            throw error;
        } finally {
            if (pool) await pool.close();
        }
    }

    static async getCourseById(id) {
        let connection = await sql.connect(dbConfig);
        try {
            const sqlQuery = `SELECT * FROM Courses WHERE CourseID = @id`;
            const request = connection.request();
            request.input('id', sql.Int, id);
            const result = await request.query(sqlQuery);
            if (result.recordset.length === 0) {
                return null;
            }
            const courseData = result.recordset[0];
            return new Courses(
                courseData.CourseID, 
                courseData.UserID, 
                courseData.Title, 
                courseData.Description, 
                courseData.Category, 
                courseData.Level, 
                courseData.Duration, 
                courseData.CreatedAt, 
                courseData.CourseImage
            );
        } catch (error) {
            console.error('Error retrieving course:', error);
            throw error;
        }finally{
            await connection.close();
        }
    }

    static async updateCourse(id, newCourseData) {
        const connection = await sql.connect(dbConfig);
        try {
            const sqlQuery = `
                UPDATE Courses SET 
                    Title = @title, 
                    Description = @description,
                    Category = @category,
                    Level = @level,
                    Duration = @duration,
                    CourseImage = @courseImage 
                WHERE CourseID = @id
            `;
            const request = connection.request();
            request.input('id', sql.Int, id);
            request.input('title', sql.NVarChar, newCourseData.title);
            request.input('description', sql.NVarChar, newCourseData.description);
            request.input('category', sql.NVarChar, newCourseData.category);
            request.input('level', sql.NVarChar, newCourseData.level);
            request.input('duration', sql.Int, newCourseData.duration);
            request.input('courseImage', sql.VarBinary, newCourseData.courseImage);
    
            await request.query(sqlQuery);
            return await this.getCourseById(id);
        } catch (error) {
            console.error('Error updating course:', error);  // Log detailed error
            throw error;
        } finally {
            await connection.close();
        }
    }

    static async deleteCourseWithNoLectures(){
        let connection = await sql.connect(dbConfig);
        try{
            const sqlQuery = `
            DELETE FROM Courses
            WHERE CourseID NOT IN (SELECT DISTINCT CourseID FROM Lectures);`
            const result = await connection.request().query(sqlQuery);
            const rowsAffected = result.rowsAffected.reduce((acc, val) => acc + val, 0);
            return rowsAffected>0;
        }catch (error) {
            console.error('Error deleting course:', error);
            throw error;
        } finally {
            if (pool) await pool.close();
        }
    }
    static async deleteCourse(id) {
        let pool;
        try {
            pool = await sql.connect(dbConfig);
            const sqlQuery = `
            DELETE FROM Lectures WHERE CourseID = @id;
            DELETE FROM Courses WHERE CourseID = @id
            `;
            const request = pool.request();
            request.input('id', sql.Int, id);
            const result = await request.query(sqlQuery);
            const rowsAffected = result.rowsAffected.reduce((acc, val) => acc + val, 0);
            console.log('DELETE COURSE MODEL OUTPUT: ', rowsAffected > 0);
            return rowsAffected > 0;
        } catch (error) {
            console.error('Error deleting course:', error);
            throw error;
        } finally {
            if (pool) await pool.close();
        }
    }
        static async createCourse(newCourseData,id) {
        const connection = await sql.connect(dbConfig);
        try {
            const sqlQuery = `
                INSERT INTO Courses (UserID, Title, Description, Category, Level, Duration, CreatedAt, CourseImage)
                VALUES (@UserID, @Title, @Description, @Category, @Level, @Duration, @CreatedAt, @CourseImage);
                SELECT SCOPE_IDENTITY() AS CourseID;
            `;
            const request = connection.request();
            request.input("UserID", sql.Int, id);
            request.input("Title", sql.NVarChar, newCourseData.title);
            request.input("Description", sql.NVarChar, newCourseData.description);
            request.input("Category", sql.NVarChar, newCourseData.category);
            request.input("Level", sql.NVarChar, newCourseData.level);
            request.input("Duration", sql.Int, newCourseData.duration);
            request.input("CreatedAt", sql.DateTime, new Date());
            request.input("CourseImage", sql.VarBinary, newCourseData.courseImage);

            const result = await request.query(sqlQuery);
            const newCourseID = result.recordset[0].CourseID;

            return newCourseID;
        } catch (error) {
            console.error('Error creating course:', error);
            throw error;
        } finally {
            await connection.close();
        }
    }    
    static async getCourseImage(id){
        const connection = await sql.connect(dbConfig);
        try{
            const sqlQuery = `SELECT CourseImage FROM Courses WHERE CourseID = @id`;
            const request = connection.request();
            request.input("id", sql.Int, id);
            const result = await request.query(sqlQuery);
            if (result.recordset.length === 0) {
                return null;
            }
            return result.recordset[0].CourseImage;
        }catch (error) {
            console.error('Error fetching course image:', error);
            throw error;
        } finally {
            await connection.close();
        }
          
    }
}
module.exports = Courses;
