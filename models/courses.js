const sql = require('mssql');
const dbConfig = require('../dbConfig');

class Courses {
    constructor(courseID, lecturerID, title, description, category, level, duration, createdAt, courseImage) {
        this.courseID = courseID;
        this.lecturerID = lecturerID;
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
            return result.recordset.map(row => new Courses(row.CourseID, row.LecturerID, row.Title, row.Description, row.Category, row.Level, row.Duration, row.CreatedAt, row.CourseImage));
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
                courseData.LecturerID, 
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
                    LecturerID = @lecturerID,
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
            request.input('lecturerID', sql.Int, newCourseData.lecturerID || null);
            request.input('title', sql.NVarChar, newCourseData.title || null);
            request.input('description', sql.NVarChar, newCourseData.description || null);
            request.input('category', sql.NVarChar, newCourseData.category || null);
            request.input('level', sql.NVarChar, newCourseData.level || null);
            request.input('duration', sql.Int, newCourseData.duration || null);
            request.input('courseImage', sql.VarBinary, newCourseData.courseImage || null);

            await request.query(sqlQuery);
            connection.close();
            return await this.getCourseById(id);
        } catch (error) {
            console.error('Error updating course:', error);  // Log detailed error
            throw error;
        }
    }

    static async deleteCourse(id) {
        let pool;
        try {
            pool = await sql.connect(dbConfig);
            const sqlQuery = `DELETE FROM Courses WHERE CourseID = @id`;
            const request = pool.request();
            request.input('id', sql.Int, id);
            const result = await request.query(sqlQuery);
            return result.rowsAffected > 0;
        } catch (error) {
            console.error('Error deleting course:', error);
            throw error;
        } finally {
            if (pool) await pool.close();
        }
    }
    static async createCourse(newCourseData) {
        const connection = await sql.connect(dbConfig);
        try {
            const sqlQuery = `
                INSERT INTO Courses (LecturerID, Title, Description, Category, Level, Duration, CreatedAt, CourseImage)
                VALUES (@LecturerID, @Title, @Description, @Category, @Level, @Duration, @CreatedAt, @CourseImage);
                SELECT SCOPE_IDENTITY() AS CourseID;
            `;
            const request = connection.request();
            request.input("LecturerID", sql.Int, newCourseData.lecturerID);
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
    
    
}

module.exports = Courses;