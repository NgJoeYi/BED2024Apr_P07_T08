const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Lectures {
    constructor(courseID, lecturerID, title, description, videoURL, video, lectureImage, duration, position, createdAt, chapterName) {
        this.courseID = courseID;
        this.lecturerID = lecturerID;
        this.title = title;
        this.description = description;
        this.videoURL = videoURL;
        this.video = video;
        this.lectureImage = lectureImage;
        this.duration = duration;
        this.position = position;
        this.createdAt = createdAt;
        this.chapterName = chapterName;
    }

    static async getAllLectures() {
        let connection = await sql.connect(dbConfig);
        try {
            const sqlQuery = `SELECT * FROM Lectures;`;
            const result = await connection.request().query(sqlQuery);
            return result.recordset.map(row => new Lectures(
                row.CourseID,
                row.LecturerID,
                row.Title,
                row.Description,
                row.VideoURL,
                row.Video,
                row.LectureImage,
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

    static async getLectureByID(id) {
        let connection = await sql.connect(dbConfig);
        try {
            const sqlQuery = `SELECT * FROM Lectures WHERE LectureID = @id`;
            const request = connection.request();
            request.input('id', sql.Int, id);
            const result = await request.query(sqlQuery);

            if (result.recordset.length === 0) {
                return null;
            }
            const lecture = result.recordset[0];
            return new Lectures(
                lecture.CourseID,
                lecture.LecturerID,
                lecture.Title,
                lecture.Description,
                lecture.VideoURL,
                lecture.Video,
                lecture.LectureImage,
                lecture.Duration,
                lecture.Position,
                lecture.CreatedAt,
                lecture.ChapterName
            );
        } catch (error) {
            console.error('Error retrieving lecture: ', error);
            throw error;
        } finally {
            await connection.close();
        }
    }

    static async updateLecture(id, newLectureData) {
        let connection = await sql.connect(dbConfig);
        try {
            const sqlQuery = `
                UPDATE Lectures SET 
                CourseID = @courseID,
                LecturerID = @lecturerID,
                Title = @title,
                Description = @description,
                VideoURL = @videoURL,
                Video = @video,
                LectureImage = @lectureImage,
                Duration = @duration,
                Position = @position,
                ChapterName = @chapterName
                WHERE LectureID = @id
            `;
            const request = connection.request();
            request.input('id', sql.Int, id);
            request.input('courseID', sql.Int, newLectureData.CourseID);
            request.input('lecturerID', sql.Int, newLectureData.LecturerID);
            request.input('title', sql.NVarChar, newLectureData.Title);
            request.input('description', sql.NVarChar, newLectureData.Description);
            request.input('videoURL', sql.NVarChar, newLectureData.VideoURL);
            request.input('video', sql.VarBinary, newLectureData.Video);
            request.input('lectureImage', sql.VarBinary, newLectureData.LectureImage);
            request.input('duration', sql.Int, newLectureData.Duration);
            request.input('position', sql.Int, newLectureData.Position);
            request.input('chapterName', sql.NVarChar, newLectureData.ChapterName);

            await request.query(sqlQuery);

            return await this.getLectureByID(id);
        } catch (error) {
            console.error("Error updating lecture: ", error);
            throw error;
        } finally {
            await connection.close();
        }
    }

    static async createLecture(newLectureData) {
        let pool;
        try {
            pool = await sql.connect(dbConfig);
            const sqlQuery = `
                INSERT INTO Lectures (CourseID, LecturerID, Title, Description, VideoURL, Video, LectureImage, Duration, Position, ChapterName)
                VALUES (@CourseID, @LecturerID, @Title, @Description, @VideoURL, @Video, @LectureImage, @Duration, @Position, @ChapterName);
                SELECT SCOPE_IDENTITY() AS LectureID;
            `;
            const request = pool.request();
            request.input('CourseID', sql.Int, newLectureData.CourseID || 1); // Assuming 1 as a default value for demonstration
            request.input('LecturerID', sql.Int, newLectureData.LecturerID);
            request.input('Title', sql.NVarChar, newLectureData.Title);
            request.input('Description', sql.NVarChar, newLectureData.Description);
            request.input('VideoURL', sql.NVarChar, newLectureData.VideoURL);
            request.input('Video', sql.VarBinary, newLectureData.Video);
            request.input('LectureImage', sql.VarBinary, newLectureData.LectureImage);
            request.input('Duration', sql.Int, newLectureData.Duration);
            request.input('Position', sql.Int, newLectureData.Position);
            request.input('ChapterName', sql.NVarChar, newLectureData.ChapterName);

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

    static async getCurrentPositionInChapter(chapterName) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
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
    // Function to get the last chapter name
    static async getLastChapterName(){
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT TOP 1 ChapterName FROM Lectures ORDER BY CreatedAt DESC`;
            const result = await connection.request().query(sqlQuery);
            return result.recordset.length ? result.recordset[0].ChapterName : null;
        } catch (error) {
            console.error('Error getting last chapter name:', error);
            throw error;
        } finally {
            if (connection) await connection.close();
        }
    };
}

module.exports = Lectures;
