const sql = require('mssql');
const dbConfig = require('../dbConfig');

class User {
    constructor(id, name, dob, email, password, role) {
        this.id = id;
        this.name = name;
        this.dob = dob;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    static async getUserById(userId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Users WHERE id=@inputUserId`;
            const request = connection.request();
            request.input('inputUserId', userId);
            const result = await request.query(sqlQuery);
            if (result.recordset.length === 0) {
                return null;
            }
            const row = result.recordset[0];
            return new User(row.id, row.name ,row.dob, row.email, row.password, row.role);
        } catch(error) {
            console.error('Error retrieving a user:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    // just want to check if user exist, hence returns true or false
    static async checkUserExist(emailInput) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Users WHERE email=@emailInput`;
            const request = connection.request();
            request.input('emailInput', emailInput);
            const result = await request.query(sqlQuery);
            return result.recordset.length > 0;
        } catch(error) {
            console.error('Error retrieving a user:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    // newUserData sent in req.body rmb to extract
    static async createUser(newUserData) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            INSERT INTO Users (name, dob, email, password, role) 
            VALUES (@inputName, @inputDob, @inputEmail, @inputPassword, @inputRole);
            SELECT SCOPE_IDENTITY() AS id;
            `;
            const request = connection.request();
            request.input('inputName', newUserData.name);
            request.input('inputDob', newUserData.dob);
            request.input('inputEmail', newUserData.email);
            request.input('inputPassword', newUserData.password);
            request.input('inputRole', newUserData.role);
            const result = await request.query(sqlQuery);
            if (result.rowsAffected[0] === 0) {
                throw new Error("User not created");
            }
            const row = result.recordset[0];

            // Create lecturer entry if the role is 'lecturer'
            if (newUserData.role === 'lecturer') {
                await User.createLecturer(row.userId);
            }

            return new User(row.id, row.name, row.dob, row.email, row.password, row.role);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    // just want to check if user exist, hence returns true or false
    static async checkUserExist(emailInput) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Users WHERE email=@emailInput`;
            const request = connection.request();
            request.input('emailInput', emailInput);
            const result = await request.query(sqlQuery);
            return result.recordset.length > 0;
        } catch(error) {
            console.error('Error retrieving a user:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    static async createLecturer(userId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            INSERT INTO Lecturer (UserID) VALUES (@userId);
            `;
            const request = connection.request();
            request.input('userId', sql.Int, userId);
            await request.query(sqlQuery);
        } catch (error) {
            console.error('Error creating lecturer:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    // userLoginData sent in req.body rmb to extract name and email
    static async loginUser(userLoginData) {
        let connection;
        try{
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            SELECT * FROM Users WHERE email=@inputEmail
            `;
            const request = connection.request();
            request.input('inputEmail', userLoginData.email);
            const result = await request.query(sqlQuery);

            const user = result.recordset[0];
            if (!user){
                return null;
            }            
            return new User(user.id, user.name, user.dob, user.email, user.password, user.role);
        } catch(error) {
            console.error('Error during login:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async updateUser(userId, newUserData) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                UPDATE Users SET 
                name=@inputName, email=@inputEmail, dob=@inputDob, password=@inputPassword
                WHERE id=@inputUserId
            `;
            const request = connection.request();
            request.input('inputName', newUserData.name);
            request.input('inputEmail', newUserData.email);
            request.input('inputDob', newUserData.dob);
            request.input('inputPassword', newUserData.password);
            request.input('inputUserId', userId);
    
            const result = await request.query(sqlQuery);
            if (result.rowsAffected[0] === 0) {
                return null;
            }
            return await this.getUserById(userId);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    
    
    static async deleteUser(userId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = 
            `
            DELETE FROM ProfilePic WHERE user_id=@user_Id;
            DELETE FROM Users WHERE id=@userId
            `;
            const request = connection.request();
            request.input('user_Id', userId);
            request.input('userId', userId);
            const results = await request.query(sqlQuery);
            if (results.rowsAffected[0] === 0) {
                return null;
            }
            return results.rowsAffected[0] > 0; //returns true 
        } catch(error) {
            console.error('Error deleting user:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async updateProfilePic(userId, profilePic) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            
            // Check if the profile picture exists
            const checkQuery = `SELECT * FROM ProfilePic WHERE user_id = @userId`;
            const checkRequest = connection.request();
            checkRequest.input('userId', userId);
            const checkResult = await checkRequest.query(checkQuery);

            let sqlQuery;
            if (checkResult.recordset.length > 0) {
                // Update if exists
                sqlQuery = `UPDATE ProfilePic SET img = @profilePic WHERE user_id = @userId`;
            } else {
                // Insert if not exists
                sqlQuery = `INSERT INTO ProfilePic (user_id, img) VALUES (@userId, @profilePic)`;
            }

            const request = connection.request();
            request.input('userId', userId);
            request.input('profilePic', profilePic);
            const result = await request.query(sqlQuery);

            if (result.rowsAffected[0] === 0) {
                return null;
            }
            return { userId, profilePic };
        } catch (error) {
            console.error('Error updating profile picture:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async getProfilePicByUserId(userId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                SELECT img FROM ProfilePic WHERE user_id=@userId
            `;
            const request = connection.request();
            request.input('userId', userId);
            const result = await request.query(sqlQuery);
            if (result.recordset.length === 0) {
                return null;
            }
            return result.recordset[0].img;
        } catch (error) {
            console.error('Error retrieving profile picture:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async getLecturerIDthroughLogin(userID) {
        const connection = await sql.connect(dbConfig);
        try {
            const lecturerQuery = `
                SELECT LecturerID FROM Lecturer WHERE UserID = @userID;
            `;
            const request = connection.request();
            request.input('userID', sql.Int, userID);
            const result = await request.query(lecturerQuery);
            if (result.recordset.length === 0) {
                return null; // No lecturer found
            }
            const LecturerID = result.recordset[0].LecturerID;
            return LecturerID;
        } catch (error) {
            console.error('Error retrieving LecturerID from User:', error);
            throw error; // Rethrowing the error for the API layer to handle
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

}

module.exports = User;