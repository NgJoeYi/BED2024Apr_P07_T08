const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Lectures{
    constructor(lectureID , courseID, lecturerID , title, description, videoURL, video, lectureImage, duration, position, createdAt ){
        this.lectureID = lectureID;
        this.courseID  = courseID;
        this.lecturerID = lecturerID;
        this.title = title;
        this.description = description;
        this.videoURL = videoURL;
        this.video = video;
        this.lectureImage = lectureImage;
        this.duration = duration;
        this.position = position;
        this.createdAt = createdAt;
    }
    
    static async getAllLectures(){
        let connection = await sql.connect(dbConfig);
        try{
            const sqlQuery = `SELECT * FROM Lectures;`
            const result = await connection.request().query(sqlQuery);
            return result.recordset.map(row => new Lectures (
                row.LectureID,
                row.CourseID,
                row.LecturerID,
                row.Title,
                row.Description,
                row.VideoURL,
                row.Video,
                row.LectureImage,
                row.Duration,
                row.Position,
                row.CreatedAt
            ));
        
        }catch(error){
            console.error('Error retrieving course: ',error);
            throw error;
        }finally{
            await connection.close();
        }
    }
    
    static async getLectureByID(id){
        let connection = await sql.connect(dbConfig);
        try{
            const sqlQuery = `SELECT * FROM Lectures WHERE LectureID = @id`;
            const request = connection.request();
            request.input('id', id);
            const result = await request.query(sqlQuery);

            if(result.recordset.length === 0){
                return null;
            }
            const lecture = result.recordset[0];
            return new Lectures(
                lecture.LectureID,
                lecture.CourseID,
                lecture.LecturerID,
                lecture.Title,
                lecture.Description,
                lecture.VideoURL,
                lecture.Video,
                lecture.LectureImage,
                lecture.Duration,
                lecture.Position,
                lecture.CreatedAt
            )
        }catch(error){
            console.error('Error retrieving course: ',error);
            throw error;

        }finally{
            await connection.close();
        }
    }

    static async updateLecture(id, newLectureData){
        const connection = await sql.connect(dbConfig);
        try{
            const sqlQuery = `
                UPDATE Lectures SET 
                CourseID = @courseID,
                LecturerID = @lecturerID,
                Title = @title, 
                Description = @description,
                VideoURL = @videoURL,
                Video =  @video,
                LectureImage = @lectureImage,
                Duration = @duration,
                Position = @position
                WHERE LectureID = @id
            `
            const request = connection.request();
            request.input('id', sql.Int,id);

            request.input('courseID' ,sql.Int, newLectureData.courseID);
            request.input('lecturerID' , sql.Int,newLectureData.lectureId);
            request.input('title' , sql.NVarChar,newLectureData.title);
            request.input('description' , sql.NVarChar,newLectureData.description);
            request.input('videoURL' , sql.NVarChar,newLectureData.videoURL);
            request.input('video' , sql.VarBinary,newLectureData.video);
            request.input('lectureImage' , sql.VarBinary,newLectureData.lectureImage);
            request.input('duration' , sql.Int,newLectureData.duration);
            request.input('position' ,sql.Int, newLectureData.position);

            await request.query(sqlQuery);

            return await this.getLectureByID(id);
        }catch(error){
            console.error("Error updating lecture: ", error);
            throw error;
        }finally{
            await connection.close();
        }
    }

    static async CreateLecture(newLectureData){
        const connection = await sql.connect(dbConfig);
        try{
            const sqlQuery = `
            INSERT INTO Lectures (CourseID, LecturerID, Title, Description, VideoURL, Video, LectureImage, Duration, Position)
            VALUES  (@courseID, @lecturerID, @title, @description, @videoURL, @video, @lectureImage, @duration, @position);
            SELECT SCOPE_IDENTITY() AS LectureID;
            `
            const request = connection.request();
            request.input('courseID', sql.Int, newLectureData.courseID);
            request.input('lecturerID' , sql.Int, newLectureData.lecturerID);
            request.input('title', sql.NVarChar, newLectureData.title);
            request.input('description',sql.NVarChar, newLectureData.description);
            request.input('videoURL', sql.NVarChar, newLectureData.videoURL);
            request.input('video', sql.VarBinary,newLectureData.video);
            request.input('lectureImage',sql.VarBinary, newLectureData.lectureImage);
            request.input('duration', sql.Int,newLectureData.duration);
            request.input('position',sql.Int, newLectureData.position);
            // request.input('createdAt' , sql.DateTime,newLectureData.createdAt);

            const result = await request.query(sqlQuery);

            return await this.getLectureByID(result.recordset[0].LectureID);

        }catch(error){
            console.error("Error creating lecture: ", error);
            throw error;
        }finally{
            await connection.close();
        }

    }
    static async deleteLecture(id){
        const connection = await sql.connect(dbConfig);
        try{
            const sqlQuery = `DELETE FROM Lectures WHERE LectureID = @id`;
            const request = await connection.request();
            request.input('id' , id);
            const result = await request.query(sqlQuery);
            return result.rowsAffected > 0;

        }catch(error){
            console.error('Error deleting lecture : ' ,error);
            throw error;
        }finally{
            await connection.close();
        }
    }
}
module.exports = Lectures;