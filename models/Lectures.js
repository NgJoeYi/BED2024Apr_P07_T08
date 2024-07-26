const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Lectures {
    constructor(lectureID, courseID, userID, title, description, video, duration, position, createdAt, chapterName) {
        this.lectureID = lectureID;
        this.courseID = courseID;
        this.userID = userID;
        this.title = title;
        this.description = description;
        this.video = video;
        this.duration = duration;
        this.position = position;
        this.createdAt = createdAt;
        this.chapterName = chapterName;
    }

    // get all lectures logic 
    static async getAllLectures() {
        let connection = await sql.connect(dbConfig);
        try {
            const sqlQuery = `SELECT * FROM Lectures;`;
            const result = await connection.request().query(sqlQuery);
            return result.recordset.map(row => new Lectures(
                row.LectureID,
                row.CourseID,
                row.UserID,
                row.Title,
                row.Description,
                row.Video,
                row.Duration,
                row.Position,
                row.CreatedAt,
                row.ChapterName
            ));
        } catch (error) {
            console.error('Error retrieving lectures: ', error);
            throw error;
        } finally {
            await connection.close();
        }
    }

    // get lecture details logic for lecture details container below the lecture video 
    static async getLectureDetails(id){
        let connection = await sql.connect(dbConfig);
        try{
            const sqlQuery = `SELECT Title, Description , Duration, CreatedAt FROM Lectures WHERE LectureID = @lectureID;`;
            const request = await connection.request();
            request.input('lectureID',sql.Int, id);
            const result = await request.query(sqlQuery);
            
            if (result.recordset.length === 0) {
                return null;
            }
            return result.recordset[0];
        }catch (error) {
            console.error('Error retrieving lecture details: ', error);
            throw error;
        } finally {
            await connection.close();
        }
    }

    // get specfic lecture by id logic 
    static async getLectureByID(id) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Lectures WHERE LectureID = @lectureID`;
            const request = connection.request();
            request.input('lectureID', sql.Int, id);
            const result = await request.query(sqlQuery);
    
            if (result.recordset.length === 0) {
                return null;
            }
    
            const lecture = result.recordset[0];
            return new Lectures(
                lecture.LectureID,
                lecture.CourseID,
                lecture.UserID,
                lecture.Title,
                lecture.Description,
                lecture.Video,
                lecture.Duration,
                lecture.Position,
                lecture.CreatedAt,
                lecture.ChapterName
            );
        } catch (error) {
            console.error('Error retrieving lecture:', error);
            throw error;
        } finally {
            if (connection) await connection.close();
        }
    }
    
    
    // update lecture logic 
    static async updateLecture(id, newLectureData) {
        let connection = await sql.connect(dbConfig);
        try {
            const sqlQuery = `
                UPDATE Lectures SET 
                Title = @title,
                Description = @description,
                Video = @video,  -- Update video filename in the database
                Duration = @duration,
                ChapterName = @chapterName
                WHERE LectureID = @id
            `;
            const request = connection.request();
            request.input('id', sql.Int, id);
            request.input('title', sql.NVarChar, newLectureData.Title);
            request.input('description', sql.NVarChar, newLectureData.Description);
            request.input('video', sql.NVarChar, newLectureData.Video); // Save the filename in the database
            request.input('duration', sql.Int, newLectureData.Duration);
            request.input('chapterName', sql.NVarChar, newLectureData.ChapterName);
    
            const result = await request.query(sqlQuery);
            return result.rowsAffected > 0;
        } catch (error) {
            console.error("Error updating lecture: ", error);
            throw error;
        } finally {
            await connection.close();
        }
    }
    
    

    // TO SET THE NEW COURSE ID 
    static async getMaxCourseID() {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const result = await connection.request().query('SELECT MAX(CourseID) AS MaxCourseID FROM Courses');
            console.log('Max CourseID:', result.recordset[0].MaxCourseID); // Added logging
            return result.recordset[0].MaxCourseID ;
        } catch (error) {
            console.error('Error retrieving max CourseID:', error);
            throw error;
        } finally {
            if (connection) await connection.close();
        }
    }

    // creating lecture
    static async createLecture(newLectureData) {
        let pool;
        try {
            pool = await sql.connect(dbConfig);
            const sqlQuery = `
                INSERT INTO Lectures (CourseID, UserID, Title, Description, Video, Duration, Position, ChapterName)
                VALUES (@CourseID, @UserID, @Title, @Description, @Video, @Duration, @Position, @ChapterName);
                SELECT SCOPE_IDENTITY() AS LectureID;
            `;
            const request = pool.request();
            request.input('CourseID', sql.Int, newLectureData.courseID);
            request.input('UserID', sql.Int, newLectureData.userID);
            request.input('Title', sql.NVarChar, newLectureData.title);
            request.input('Description', sql.NVarChar, newLectureData.description);
            request.input('Video', sql.NVarChar, newLectureData.video); // Storing the filename
            request.input('Duration', sql.Int, newLectureData.duration);
            request.input('Position', sql.Int, newLectureData.position);
            request.input('ChapterName', sql.NVarChar, newLectureData.chapterName);

            const result = await request.query(sqlQuery);
            const newLectureID = result.recordset[0].LectureID;
            return newLectureID;
        } catch (error) {
            console.error('Error creating lecture:', error);
            throw error;
        } finally {
            if (pool) pool.close();
        }
    }
    
    // this is for courses with multiple lectures, we need this so i know which position the new lecture should be in 
    static async getCurrentPositionInChapter(chapterName) {
        let connection = await sql.connect(dbConfig);
        try {
            const sqlQuery = `SELECT MAX(Position) as Position FROM Lectures WHERE ChapterName = @ChapterName`;
            const result = await connection.request()
                .input('ChapterName', sql.NVarChar, chapterName)
                .query(sqlQuery);
            const currentPosition = result.recordset[0].Position;
            return currentPosition ? currentPosition + 1 : 1;
        } catch (error) {
            console.error('Error getting current position:', error);
            throw error;
        } finally {
            if (connection) await connection.close();
        }
    }

    // this is for lectures that are put under the previous chapter 
    static async getLastChapterName(userID) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT TOP 1 ChapterName FROM Lectures WHERE UserID =  @userID  ORDER BY CreatedAt DESC `;
            const result = await connection.request()
                .input('userID', sql.Int, userID)
                .query(sqlQuery);

            if (result.recordset.length === 0) {
                console.log("No chapters found in the database.");
                return null;
            } else {
                console.log("Last chapter name found:", result.recordset[0].ChapterName);
                return result.recordset[0].ChapterName;
            }
        } catch (error) {
            console.error('Error getting last chapter name:', error);
            throw error;
        } finally {
            await connection.close();
        }
    }

     // for playing lecture video
     static async getLectureVideoByID(lectureID) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const result = await connection.request()
                .input('lectureID', sql.Int, lectureID)
                .query('SELECT Video FROM Lectures WHERE LectureID = @lectureID');
    
            console.log(`Query result: ${result.recordset.length} records found`);
    
            if (result.recordset.length === 0) {
                return null;
            }
    
            return result.recordset[0].Video; // Return the filename, not the video data
        } catch (error) {
            console.error('Error retrieving lecture video:', error);
            throw error;
        } finally {
            if (connection) await connection.close();
        }
    }
    

    // displaying lectures under the specific course 
    static async getLecturesByCourseID(courseID) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const result = await connection.request()
                .input('courseID', sql.Int, courseID)
                .query('SELECT * FROM Lectures WHERE CourseID = @courseID');
    
            console.log(`Query result: ${result.recordset.length} records found`);
    
            if (result.recordset.length === 0) {
                return [];
            }
    
            return result.recordset;
        } catch (error) {
            console.error('Error retrieving lectures:', error);
            throw error;
        } finally {
            if (connection) await connection.close();
        }
    }

    // delete specific lecture logic 
    static async deleteLecture(id) {
        let pool;
        try {
            pool = await sql.connect(dbConfig);
            const sqlQuery = `DELETE FROM Lectures WHERE LectureID = @id`;
            const request = pool.request();
            request.input('id', sql.Int, id);
            const result = await request.query(sqlQuery);
            return result.rowsAffected > 0;
        } catch (error) {
            console.error('Error deleting lecture:', error);
            throw error;
        } finally {
            if (pool) await pool.close();
        }
    }

    // delete entire chapter logic 
    static async deletingChapterName(courseID, chapterName) {
        let connection = await sql.connect(dbConfig);
        try {
            const sqlQuery = `DELETE FROM Lectures WHERE CourseID = @courseID AND ChapterName = @chapterName`;
            const request = connection.request();
            request.input('courseID', sql.Int, courseID);
            request.input('chapterName', sql.NVarChar, chapterName);
            const result = await request.query(sqlQuery);
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error deleting chapter:', error);
            throw error;
        } finally {
            if (connection) await connection.close();
        }
    }
        
}
module.exports = Lectures;
