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
            return new User(row.id, row.name, row.dob, row.email, row.password, row.role);
        } catch(error) {
            console.error('Error creating user:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    // --------------------------------------------------------------------------------------------------------- move bcrypt to controller
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


    /*
    // since password need to be compared in controller
    static async loginUser(loginData) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Users WHERE email=@emailInput`;
            const request = connection.request();
            const result = await request.query(sqlQuery);
            const user = result.recordset[0]; // since only need 1 user
            if (!user) {
                throw new
            }
        }
    }
    */

    // --------------------------------------------------------------------------------------------------------- move bcrypt to controller
    static async updateUser(userId, newUserData) {
        let connection;
        try {    
            // Fetch the existing user
            const user = await this.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            connection = await sql.connect(dbConfig);

    
            // Prepare the updated fields
            const updatedFields = {
                name: newUserData.name || user.name,
                email: newUserData.email || user.email,
                dob: newUserData.dob || user.dob,
                password: user.password 
            };
            // If a new password is provided, hash it
            if (newUserData.newPassword) {
                updatedFields.password = await bcrypt.hash(newUserData.newPassword, 10);
            }
    
            // Update the user in the database
            const sqlQuery = `
                UPDATE Users SET 
                name=@inputName, email=@inputEmail, dob=@inputDob, password=@inputPassword
                WHERE id=@inputUserId
            `;
            const request = connection.request();
            request.input('inputName', updatedFields.name);
            request.input('inputEmail', updatedFields.email);
            request.input('inputDob', updatedFields.dob);
            request.input('inputPassword', updatedFields.password);
            request.input('inputUserId', userId);
    
            const result = await request.query(sqlQuery);
    
            if (result.rowsAffected[0] === 0) {
                throw new Error("User not updated");
            }
    
            // Return the updated user
            return await this.getUserById(userId);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        } finally {
            if (connection) {
                // Ensure the connection is properly closed
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
            DELETE FROM Users WHERE id=@userId
            `;
            const request = connection.request();
            request.input('userId', userId);
            const results = await request.query(sqlQuery);
            if (results.rowsAffected[0] === 0) {
                throw new Error("User not deleted");
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
}

module.exports = User;