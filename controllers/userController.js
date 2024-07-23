const User = require('../models/User'); // ------------------------------------- Import Users model
const bcrypt = require('bcryptjs'); // ----------------------------------------- Import the bcryptjs library for password hashing and comparison
const jwt = require('jsonwebtoken'); // ---------------------------------------- Import the jsonwebtoken library for generating JWT tokens

// Function to get a user by their ID
const getUserById = async (req, res) => {
    //const userId = parseInt(req.params.id);
    const userId = req.user.id; // ------------------------------------------------------------------- Get the user ID from the request object
    try {
        const user = await User.getUserById(userId); // ---------------------------------------------- Fetch the user from the database using the user ID
        if (!user) {
            return res.status(404).send('User does not exist'); // ----------------------------------- If user does not exist, send a 404 response
        }
        res.status(200).json(user); // --------------------------------------------------------------- Send the user data in the response
    } catch (error) {
        console.error('Server error:', error); // ---------------------------------------------------- Log error details
        res.status(500).send('Server error');
    }
};

// Function to create a new user
const createUser = async (req, res) => {
    const newUserData = req.body; // ----------------------------------------------------------------- Get the new user data from the request body
    try {
        const existingUser = await User.getUserByEmail(newUserData); // ------------------------------ Check if a user with the provided email already exists
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
        } 
        // Hash the password
        const hashedPassword = await bcrypt.hash(newUserData.password, 10);
        newUserData.password = hashedPassword; // ---------------------------------------------------- Replace plain text password with hashed password  
               
        const newUser = await User.createUser(newUserData); // --------------------------------------- Create a new user in the database
        if (!newUser) { // --------------------------------------------------------------------------- If user creation fails, log and send an error response
            console.error('Error: User creation failed');
            return res.status(400).json({ message: 'Could not create an account' });
        }
        res.status(201).json({ userId: newUser.id }); // --------------------------------------------- Send the new user's ID in the response
    } catch (error) {
        console.error('Server error:', error); // ---------------------------------------------------- Log error details
        res.status(500).send('Server error');
    }
};

// ************************************** JWT **************************************
// Function to log in a user
const loginUser = async (req, res) => {
    const { email, password } = req.body; // --------------------------------------------------------- Get the email and password from the request body
    try {
        // if (!password) {
        //     return res.status(400).json({ message: 'Please enter your password' });
        // } did it in middleware alr

        const loginSuccess = await User.getUserByEmail({ email }); // -------------------------------- Fetch the user by email
        if (!loginSuccess) { // ---------------------------------------------------------------------- If no user is found, send a 404 response
            return res.status(404).send( { message: 'Invalid email. No user found'} );
        }
        const matchPassword = await bcrypt.compare(password, loginSuccess.password); // -------------- Compare the provided password with the stored hashed password
        if (!matchPassword) { // --------------------------------------------------------------------- If the password does not match, send a 404 response
            return res.status(404).json( { message: 'Invalid password. Please try again'} );
        }

        const payload = { // ------------------------------------------------------------------------- Create a JWT payload with the user's ID and role
            id: loginSuccess.id,
            role: loginSuccess.role,
        };
        const token = jwt.sign(payload, process.env.SECRET_TOKEN, { expiresIn: '3600s' }); // -------- Generate a JWT token with a 1-hour expiration time
        res.status(200).json({ token, role: loginSuccess.role,  userId: loginSuccess.id }); // ------- Send the token, role, and user ID in the response, user id is for front end visibility purpose.
        //res.status(200).json(loginSuccess);
    } catch (error) {
        console.error('Server error:', error); // ---------------------------------------------------- Log error details
        res.status(500).send('Server error');
    }
};
// ************************************** JWT **************************************

// Function to update user data
const updateUser = async (req, res) => {
    const userId = req.user.id; // ------------------------------------------------------------------ Get the user ID from the request object
    const newUserData = req.body; // ---------------------------------------------------------------- Get the new user data from the request body
    try {
        const user = await User.getUserById(userId); // --------------------------------------------- Get the current user 
        if (!user) { // ----------------------------------------------------------------------------- If user does not exist, send a 404 response
            return res.status(404).json({ message: 'User does not exist' });
        }

        if (newUserData.email !== user.email) { // -------------------------------------------------- If there were changes made to the email, check if the email alr exists
            const checkEmailExist = await User.getUserByEmail(newUserData);
            if (checkEmailExist) {
                return res.status(400).json({ message: 'Email is already in use' }); // note to self: check message appears (edit: done)
            }
        }

        if (newUserData.newPassword) { // ----------------------------------------------------------- Check if the user wants to change their password
            if (!newUserData.currentPassword) {
                return res.status(400).json({ message: 'Current password is required to set a new password' });
            }
            const isPasswordMatch = await bcrypt.compare(newUserData.currentPassword, user.password);
            if (!isPasswordMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' }); // note to self: check message appears. (edit: done)
            }
            if (newUserData.newPassword === newUserData.currentPassword) {
                return res.status(400).json({ message: 'New password cannot be the same as the current password' });
            }
            newUserData.password = await bcrypt.hash(newUserData.newPassword, 10);
        } else {
            newUserData.password = user.password;
        }

        const updatedUser = await User.updateUser(userId, { // -------------------------------------- Update the user data in the database
            name: newUserData.name || user.name,
            email: newUserData.email || user.email,
            dob: newUserData.dob || user.dob,
            password: newUserData.password
        });

        res.status(200).json(updatedUser); // ------------------------------------------------------ Send the updated user data in the response
    } catch (error) {
        console.error('Server error:', error); // -------------------------------------------------- Log error details
        res.status(500).send('Server error');
    }
};


// note to self: after implementing the basics i want to prompt user 
// to enter password before account is actually deleted (edit: done)
// Function to delete a user account
const deleteUser = async (req, res) => {
    const userId = req.user.id;    // ------------------------------------------------------------- Get the user ID from the request object
    const { password } = req.body; // ------------------------------------------------------------- Get the password from the request body
    try {
        if (!password) { // ----------------------------------------------------------------------- If no password is provided, send a 400 response
            return res.status(400).json({ message: 'Please enter your password' }); // note to self: check message appears (edit: done)
        }

        const checkUser = await User.getUserById(userId); // -------------------------------------- Fetch the user data from the database
        if (!checkUser) { // ---------------------------------------------------------------------- If user does not exist, send a 404 response
            return res.status(404).json({ message: 'User does not exist' });
        }

        const isPasswordMatch = await bcrypt.compare(password, checkUser.password); // ------------ Compare current password and the password in the database 
        if (!isPasswordMatch) { // ---------------------------------------------------------------- If the password does not match, send a 400 response
            return res.status(400).json({ message: 'Password is incorrect' }); // note to self: check message appears (edit: done)
        }

        const deleteFK = await User.deleteUtility(); // ------------------------------------------- Delete user-related records (foreign keys)
        if (!deleteFK) { // ----------------------------------------------------------------------- If deletion of user-related records fails, send a 500 response
            return res.status(500).json({ message: 'Failed to delete user-related records' });
        }
        const userDeleted = await User.deleteUser(userId); // ------------------------------------- Delete the user from the database
        if (!userDeleted) { // -------------------------------------------------------------------- If user deletion fails, send a 500 response
            return res.status(500).json({ message: 'Failed to delete user' });
        }
        res.status(204).json({ message: 'Account deleted successfully' }); // --------------------- Send a success response with no content
    } catch (error) {
        console.error('Server error:', error); // ------------------------------------------------- Log error details
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Function to update the user's profile picture
const updateProfilePic = async (req, res) => {
    const userId = req.user.id; // --------------------------------------------------------------- Get the user ID from the request object
    const { profilePic } = req.body; // ---------------------------------------------------------- Get the new profile picture URL from the request body

    try {
        const updatedProfilePic = await User.updateProfilePic(userId, profilePic); // ------------ Update the profile picture in the database
        if (!updatedProfilePic) { // ------------------------------------------------------------- If profile picture update fails, send a 400 response
            return res.status(400).send('Failed to update profile picture');
        }
        res.status(200).json(updatedProfilePic); // ---------------------------------------------- Send the updated profile picture data in the response
    } catch (error) {
        console.error('Server error:', error); // ------------------------------------------------ Log error details
        res.status(500).send('Server error');
    }
};

// Function to get the user's profile picture by their ID
const getProfilePicByUserId = async (req, res) => {
    const userId = req.user.id; // -------------------------------------------------------------- Get the user ID from the request object
    try {
        const user = await User.getUserById(userId); // ----------------------------------------- Fetch the user data from the database
        if (!user) { // ------------------------------------------------------------------------- If user does not exist, send a 404 response
            return res.status(404).send('User does not exist');
        }

        let profilePic = await User.getProfilePicByUserId(userId); // -------------------------- Fetch the profile picture from the database
        if (!profilePic) { // ------------------------------------------------------------------ If no profile picture is found, set a default profile picture
            profilePic = 'images/profilePic.jpeg'; // Default profile picture
        }
        res.status(200).json({ profilePic }); // ----------------------------------------------- Send the profile picture data in the response
    } catch (error) {
        console.error('Server error:', error); // ---------------------------------------------- Log error details
        res.status(500).send('Server error');
    }
};

module.exports = {
    getUserById,
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    updateProfilePic,
    getProfilePicByUserId
};

// ------------ KNOWLEDGE ATTAINED FROM BCRYPT ------------
// 1. hashing the password so if even 2 users have the same password, the hash value is different

// 2. bcrypt.hash(newUserData.newPassword, 10) the 10 in this is the level of security, 
// the higher the value, the more secure it is because it is the number of times hashing algo is executed
// it is known as salt rounds

// 3. bcrypt.compare(userLoginData.password, user.password) this bcrypt.compare 
// compares the plain text password and the hashed password, returns true if match, & false otherwise
