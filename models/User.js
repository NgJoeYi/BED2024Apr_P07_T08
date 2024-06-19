const sql = require('mssql');
const bcrypt = require('bcrypt');
const dbConfig = require('../dbConfig');

class User {
    constructor(userId, name, dob, email, password, role) {
        this.userId = userId;
        this.name = name;
        this.dob = dob;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // check if user exists or not. verify email exists in users table
    static async userExists(loginInput) {
        let connection;
        try{
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Users WHERE email=@inputEmail`;
            const request = connection.request();
            request.input('inputEmail', loginInput.email);
            const result = await request.query(sqlQuery);
            if (result.recordset.length === 0) {
                return null;
            }
            // return only the first one because email is unique
            return result.recordset[0]; 
        } catch(error) {
            console.error('Error checking if user exists:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    // get user details by id 
    // userid is params
    static async getUserById(userId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Users WHERE userId=@inputUserId`;
            const request = connection.request();
            request.input('inputUserId', userId);
            const result = await request.query(sqlQuery);
            if (result.recordset.length === 0) {
                return null;
            }
            const row = result.recordset[0];
            return new User(row.userId, row.name, row.dob, row.email, row.password, row.role);
        } catch (error) {
            console.error('Error getting user details:', error);
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
            SELECT SCOPE_IDENTITY() AS userId;
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
            return new User(row.userId, row.name, row.dob, row.email, row.password, row.role);
        } catch(error) {
            console.error('Error creating user:', error);
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
                throw new Error("User not found");
            }
            
            // checking if password is valid or not
            const matchPassword = await bcrypt.compare(userLoginData.password, user.password);

            // if password dont match the one stored in the db
            if (!matchPassword) {
                throw new Error("Invalid Password");
            }
            
            return new User(user.userId, user.name, user.dob, user.email, user.password, user.role);
        } catch(error) {
            console.error('Error during login:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

}

module.exports = User;