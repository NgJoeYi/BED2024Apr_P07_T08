const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Lectures{
    constructor(lecturerID , userID, profilePicture, createdAt){
        this.lecturerID = lecturerID;
        this.userID = userID;
        this.profilePicture = profilePicture;
        this.createdAt = createdAt;

    }
}