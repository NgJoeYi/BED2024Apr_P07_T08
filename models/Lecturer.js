const dbConfig = require('../dbConfig');
const sql = require('mssql');

class Lecturers{
    constructor(lecturerID, userID, profilePicture, createdAt){
        this.lecturerID = lecturerID;
        this.userID = userID;
        this.profilePicture = profilePicture;
        this.createdAt = createdAt;
    }
    static async getAllLecturers(){
        const connection = await sql.connect(dbConfig);
        try{
            const sqlQuery = `SELECT * FROM Lecturer`;
            const result = await connection.request().query(sqlQuery);
            return result.recordset.map(row=>{
                console.log(row);
                return new Lecturers(
                    row.LecturerID,
                    row.UserID,
                    row.ProfilePicture,
                    row.CreatedAt
                )}
            )}catch(error){
            console.error("Error retrieving lecturers:", error);
            throw error;
        }finally{
            connection.close();
        }
    }
    static async getLecturerByID(id) {
        const connection = await sql.connect(dbConfig);
        try {
            const sqlQuery = `SELECT * FROM Lecturer WHERE LecturerID = @id`;
            const request = connection.request();
            request.input('id', sql.Int, id);
            const result = await request.query(sqlQuery);
            
            if (result.recordset.length === 0) {
                console.log(`No lecturer found with ID ${id}`);
                return null;
            }
            const lecturerData = result.recordset[0];
            console.log('Retrieved lecturer:', lecturerData);
            return new Lecturers(
                lecturerData.LecturerID,
                lecturerData.UserID,
                lecturerData.ProfilePicture,
                lecturerData.CreatedAt
            );
        } catch (error) {
            console.error("Error retrieving lecturer:", error);
            throw error;
        } finally {
            await connection.close();
        }
    }
    static async createLecturer(newLecturerData){
        const connection = await sql.connect(dbConfig);
        try{
            const sqlQuery = `
            INSERT INTO Lecturer (ProfilePicture)
            VALUES ( @profilePicture);
            SELECT SCOPE_IDENTITY() AS LecturerID;
            `
            const request = await connection.request();
            request.input('profilePicture', sql.VarBinary,newLecturerData.profilePicture);
            
            const result = await request.query(sqlQuery);
            
            return await this.getLecturerByID(result.recordset[0].LecturerID);
        }catch(error){
            console.error("Error creating lecturers:", error);
            throw error;
        }finally{
            await connection.close();
        }
    }
    static async deleteLecturer(id){
        const connection = await sql.connect(dbConfig);
        try{
            const sqlQuery = `
            -- Delete related data from Lectures
            DELETE FROM Lectures 
            WHERE LecturerID = @id;

            -- Delete related data from Courses
            DELETE FROM Courses 
            WHERE LecturerID = @id;

            -- Delete the lecturer from Lecturer table
            DELETE FROM Lecturer 
            WHERE LecturerID = @id;
            `;
            const request = await connection.request();
            request.input('id',id);
            const result = await request.query(sqlQuery);
            return result.rowsAffected>0;
        }catch(error){
            console.error("Error deleting lecturers:", error);
            throw error;
        }finally{
            await connection.close();
        }
    }
}
module.exports = Lecturers;