const sql = require('mssql');
const dbConfig = require('../dbConfig');

class User{
    constructor(user_id, username, passwordHash, role) {
        this.user_id = user_id,
        this.username = username,
        this.passwordHash = passwordHash,
        this.role = role
    }

    static async getUserById(userId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Users WHERE user_id=@userId`;
            const request = connection.request();
            request.input('userId', userId);
            const result = await request.query(sqlQuery);
            if (result.recordset[0] === 0){
                return null;
            }
            const row = result.recordset[0];
            return new User(row.id, row.username, row.passwordHash, row.role);
        } catch (error) {
            console.error(error);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async getUserByUsername(usernameInput) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Users WHERE username=@usernameInput`;
            const request = connection.request();
            request.input('usernameInput', usernameInput);
            const result = await request.query(sqlQuery);
            if (result.recordset.length === 0) {
                return null;
            }
            const row = result.recordset[0];
            return new User(row.id, row.username, row.passwordHash, row.role);
        } catch (error) {
            console.error(error);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async createUser(newUserData) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
            INSERT INTO Users (username, passwordHash, role)
            VALUES (@usernameInput, @hashedPassword, @roleInput)
          `;
            const request = connection.request();
            request.input('usernameInput', newUserData.username);
            request.input('hashedPassword', newUserData.passwordHash);
            request.input('roleInput', newUserData.role);
            const result = await request.query(sqlQuery);

            if (result.recordset.length === 0) {
                return null;
            }
            return await this.getUserById(result.recordset[0].user_id);
        } catch (error) {
            console.error(error);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

module.exports = User;