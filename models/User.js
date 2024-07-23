const sql = require('mssql'); // ----------------------------------------------------------- Import the mssql library for SQL Server database operations
const dbConfig = require('../dbConfig'); // ------------------------------------------------ Import the database configuration settings



class User { // ---------------------------------------------------------------------------- Define the User class with properties and methods for database operations
    constructor(id, name, dob, email, password, role) { // --------------------------------- Constructor to initialize a User object with given properties
        this.id = id;
        this.name = name;
        this.dob = dob;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Method to get a user by their ID
    static async getUserById(userId) {
        let connection; // ------------------------------------------------------------------------- Declare a variable for the database connection
        try {
            connection = await sql.connect(dbConfig); // ------------------------------------------- Establish a connection to the database
            const sqlQuery = `SELECT * FROM Users WHERE id=@inputUserId`; // ----------------------- SQL query to select a user by their ID
            const request = connection.request(); // ----------------------------------------------- Create a request object for the query
            request.input('inputUserId', userId); // ----------------------------------------------- Add the userId as an input parameter for the query
            const result = await request.query(sqlQuery); // --------------------------------------- Execute the query and store the result
            if (result.recordset.length === 0) { // ------------------------------------------------ Check if no user was found
                return null; // -------------------------------------------------------------------- Return null if no user is found
            }
            const row = result.recordset[0]; // ---------------------------------------------------- Get the first row from the result set
            return new User(row.id, row.name ,row.dob, row.email, row.password, row.role); // ------ Create and return a new User object with the data from the row
        } catch(error) {
            console.error('Error retrieving a user:', error); // ----------------------------------- Log any errors that occur during the process
            throw error; // ------------------------------------------------------------------------ Throw the error to be handled by the calling function
        } finally {
            if (connection) { // ------------------------------------------------------------------- Close the database connection if it was established
                await connection.close();
            }
        }
    }

    // newUserData sent in req.body rmb to extract
    // Method to create a new user
    static async createUser(newUserData) {
        let connection; // ------------------------------------------------------------------------- Declare a variable for the database connection
        try {
            connection = await sql.connect(dbConfig); // ------------------------------------------- Establish a connection to the database
            const sqlQuery = ` 
            INSERT INTO Users (name, dob, email, password, role) 
            VALUES (@inputName, @inputDob, @inputEmail, @inputPassword, @inputRole);
            SELECT SCOPE_IDENTITY() AS id;
            `; // ---------------------------------------------------------------------------------- SQL query to insert a new user and get the new user's ID
            const request = connection.request(); // ----------------------------------------------- Create a request object for the query
            // ------------------------------------------------------------------------------------- Add the new user data as input parameters for the query
            request.input('inputName', newUserData.name);
            request.input('inputDob', newUserData.dob);
            request.input('inputEmail', newUserData.email);
            request.input('inputPassword', newUserData.password);
            request.input('inputRole', newUserData.role);

            const result = await request.query(sqlQuery); // --------------------------------------- Execute the query and store the result
            if (result.rowsAffected[0] === 0) { // ------------------------------------------------- Check if no rows were affected (user was not created)
                throw new Error("User not created");
            }
            const row = result.recordset[0]; // ---------------------------------------------------- Get the first row from the result set
            return new User(row.id, row.name, row.dob, row.email, row.password, row.role); // ------ Create and return a new User object with the data from the row
        } catch(error) {
            console.error('Error creating user:', error); // --------------------------------------- Log any errors that occur during the process
            throw error; // ------------------------------------------------------------------------ Throw the error to be handled by the calling function
        } finally {
            if (connection) { // ------------------------------------------------------------------- Close the database connection if it was established
                await connection.close();
            }
        }
    }

    // userLoginData sent in req.body rmb to extract name and email
    // FOR LOG IN AND ALSO CAN CHECK IF THE EMAIL IS ALREADY IN USE
    // Method to get a user by their email (for login and email check)
    static async getUserByEmail(userLoginData) {
        let connection; // ------------------------------------------------------------------------- Declare a variable for the database connection
        try{
            connection = await sql.connect(dbConfig); // ------------------------------------------- Establish a connection to the database
            const sqlQuery = `
            SELECT * FROM Users WHERE email=@inputEmail
            `; // ---------------------------------------------------------------------------------- SQL query to select a user by their email
            const request = connection.request(); // ----------------------------------------------- Create a request object for the query
            request.input('inputEmail', userLoginData.email); // ----------------------------------- Add the email as an input parameter for the query
            const result = await request.query(sqlQuery); // --------------------------------------- Execute the query and store the result

            const user = result.recordset[0]; // --------------------------------------------------- Get the first row from the result set
            if (!user){ // ------------------------------------------------------------------------- Check if no user was found
                return null; // -------------------------------------------------------------------- Return null if no user is found
            }            
            return new User(user.id, user.name, user.dob, user.email, user.password, user.role); // Create and return a new User object with the data from the row
        } catch(error) {
            console.error('Error during login:', error); // --------------------------------------- Log any errors that occur during the process
            throw error; // ----------------------------------------------------------------------- Throw the error to be handled by the calling function
        } finally {
            if (connection) { // ------------------------------------------------------------------ Close the database connection if it was established
                await connection.close();
            }
        }
    }

    // Method to update a user's data
    static async updateUser(userId, newUserData) {
        let connection; // ------------------------------------------------------------------------- Declare a variable for the database connection
        try {
            connection = await sql.connect(dbConfig); // ------------------------------------------- Establish a connection to the database
            const sqlQuery = `
                UPDATE Users SET 
                name=@inputName, email=@inputEmail, dob=@inputDob, password=@inputPassword
                WHERE id=@inputUserId
            `; // --------------------------------------------------------------------------------- SQL query to update a user's data
            const request = connection.request(); // ---------------------------------------------- Create a request object for the query
            // ------------------------------------------------------------------------------------ Add the new user data and userId as input parameters for the query
            request.input('inputName', newUserData.name);
            request.input('inputEmail', newUserData.email);
            request.input('inputDob', newUserData.dob);
            request.input('inputPassword', newUserData.password);
            request.input('inputUserId', userId);
    
            const result = await request.query(sqlQuery); // ------------------------------------- Execute the query and store the result
            if (result.rowsAffected[0] === 0) { // ----------------------------------------------- Check if no rows were affected (user was not updated)
                return null; // ------------------------------------------------------------------ Return null if no rows were affected
            }
            return await this.getUserById(userId); // -------------------------------------------- Get and return the updated user
        } catch (error) {
            console.error('Error updating user:', error); // ------------------------------------- Log any errors that occur during the process
            throw error; // ---------------------------------------------------------------------- Throw the error to be handled by the calling function
        } finally {
            if (connection) { // ----------------------------------------------------------------- Close the database connection if it was established
                await connection.close();
            }
        }
    }
    
    
    // Method to delete a user
    static async deleteUser(userId) {
        let connection; // ------------------------------------------------------------------------- Declare a variable for the database connection
        try {
            connection = await sql.connect(dbConfig); // ------------------------------------------- Establish a connection to the database
            const sqlQuery = `
                DELETE FROM Users WHERE id=@userId;
            `; // ---------------------------------------------------------------------------------- SQL query to delete a user by their ID
            const request = connection.request(); // ----------------------------------------------- Create a request object for the query
            request.input('userId', userId); // ---------------------------------------------------- Add the userId as an input parameter for the query
            const results = await request.query(sqlQuery); // -------------------------------------- Execute the query and store the result
            if (results.rowsAffected[0] === 0) { // ------------------------------------------------ Check if no rows were affected (user was not deleted)
                return null; // -------------------------------------------------------------------- Return null if no rows were affected
            }
            return results.rowsAffected[0] > 0; // ------------------------------------------------- Return true if the user was deleted
        } catch (error) {
            console.error('Error deleting user:', error); // --------------------------------------- Log any errors that occur during the process
            throw error; // ------------------------------------------------------------------------ Throw the error to be handled by the calling function
        } finally {
            if (connection) { // ------------------------------------------------------------------- Close the database connection if it was established
                await connection.close();
            }
        }
    }

    // Method to delete user-related records (foreign keys)
    static async deleteUtility() { 
        let connection; // ------------------------------------------------------------------------- Declare a variable for the database connection
        try {
            connection = await sql.connect(dbConfig); // ------------------------------------------- Establish a connection to the database
            const sqlQuery = `
                DECLARE @sql NVARCHAR(MAX) = N'';
                
                SELECT @sql += ' ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(f.parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(f.parent_object_id)) + 
                                ' DROP CONSTRAINT ' + QUOTENAME(f.name) + ';'
                FROM sys.foreign_keys AS f
                INNER JOIN sys.foreign_key_columns AS fc
                ON f.object_id = fc.constraint_object_id
                WHERE fc.referenced_object_id = OBJECT_ID(N'Users');
                
                EXEC sp_executesql @sql;
            `; // --------------------------------------------------------------------------------- SQL query to delete foreign keys related to the Users table
            const request = connection.request(); // ---------------------------------------------- Create a request object for the query
            const results = await request.query(sqlQuery); // ------------------------------------- Execute the query and store the result
            return results.rowsAffected.length > 0; // -------------------------------------------- Return true if any rows were affected (constraints were dropped)
        } catch (error) {
            console.error('Error deleting user-related records:', error); // ---------------------- Log any errors that occur during the process
            throw error; // ----------------------------------------------------------------------- Throw the error to be handled by the calling function
        } finally {
            if (connection) { // ------------------------------------------------------------------ Close the database connection if it was established
                await connection.close();
            }
        }
    }


    // Method to update a user's profile picture
    static async updateProfilePic(userId, profilePic) {
        let connection; // ------------------------------------------------------------------------- Declare a variable for the database connection
        try {
            connection = await sql.connect(dbConfig); // ------------------------------------------- Establish a connection to the database
            
            // Check if the profile picture exists
            const checkQuery = `SELECT * FROM ProfilePic WHERE user_id = @userId`; // -------------- SQL query to get the profile picture for the user
            const checkRequest = connection.request(); // ------------------------------------------ Create a request object for the check query
            checkRequest.input('userId', userId); // ----------------------------------------------- Add the userId as an input parameter for the check query
            const checkResult = await checkRequest.query(checkQuery); // --------------------------- Execute the check query and store the result

            let sqlQuery;
            if (checkResult.recordset.length > 0) { // --------------------------------------------- If a profile picture exists, update it
                // Update if exists
                sqlQuery = `UPDATE ProfilePic SET img = @profilePic WHERE user_id = @userId`;
            } else { // ---------------------------------------------------------------------------- If a profile picture does not exist, insert a new one
                // Insert if not exists
                sqlQuery = `INSERT INTO ProfilePic (user_id, img) VALUES (@userId, @profilePic)`;
            }

            const request = connection.request(); // ---------------------------------------------- Create a request object for the update/insert query
            // ------------------------------------------------------------------------------------ Add the userId and profilePic as input parameters for the query
            request.input('userId', userId);
            request.input('profilePic', profilePic);

            const result = await request.query(sqlQuery); // ------------------------------------- Execute the query and store the result
            if (result.rowsAffected[0] === 0) { // ----------------------------------------------- Check if no rows were affected (profile picture was not updated/inserted)
                return null; // ------------------------------------------------------------------ Return null if no rows were affected
            }
            return { userId, profilePic }; // ---------------------------------------------------- Return an object with the userId and profilePic
        } catch (error) {
            console.error('Error updating profile picture:', error); // -------------------------- Log any errors that occur during the process
            throw error; // ---------------------------------------------------------------------- Throw the error to be handled by the calling function
        } finally {
            if (connection) { // ----------------------------------------------------------------- Close the database connection if it was established
                await connection.close();
            }
        }
    }

    // Method to get a user's profile picture by their ID
    static async getProfilePicByUserId(userId) {
        let connection; // ------------------------------------------------------------------------- Declare a variable for the database connection
        try {
            connection = await sql.connect(dbConfig); // ------------------------------------------- Establish a connection to the database
            const sqlQuery = `
                SELECT img FROM ProfilePic WHERE user_id=@userId
            `; // ---------------------------------------------------------------------------------- SQL query to select a profile picture by the user's ID
            const request = connection.request(); // ----------------------------------------------- Create a request object for the query
            request.input('userId', userId); // ---------------------------------------------------- Add the userId as an input parameter for the query
            const result = await request.query(sqlQuery); // --------------------------------------- Execute the query and store the result
            if (result.recordset.length === 0) { // ------------------------------------------------ Check if no profile picture was found
                return null; // -------------------------------------------------------------------- Return null if no profile picture is found
            }
            return result.recordset[0].img; // ----------------------------------------------------- Return the profile picture
        } catch (error) {
            console.error('Error retrieving profile picture:', error); // -------------------------- Log any errors that occur during the process
            throw error; // ------------------------------------------------------------------------ Throw the error to be handled by the calling function
        } finally {
            if (connection) { // ------------------------------------------------------------------- Close the database connection if it was established
                await connection.close();
            }
        }
    }
}

module.exports = User;