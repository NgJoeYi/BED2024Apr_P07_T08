const User = require('../models/User');
const bcrypt = require('bcrypt');

const getUserById = async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        const user = await User.getUserById(userId);
        if (!user) {
            return res.status(404).send('User does not exist');
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Server error:', error); // Log error details
        res.status(500).send('Server error');
    }
};


const createUser = async (req, res) => {
    const newUserData = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.userExists(newUserData);
        if (existingUser) {
            return res.status(400).send('User already exists');
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(newUserData.password, 10);
        newUserData.password = hashedPassword; // Replace plain text password with hashed password  
               
        const newUser = await User.createUser(newUserData); 
        if (!newUser) {
            console.error('Error: User creation failed');
            return res.status(400).send('Error creating user');
        }
        res.status(201).json({ userId: newUser.userId });
    } catch (error) {
        console.error('Server error:', error); // Log error details
        res.status(500).send('Server error');
    }
};

const loginUser = async (req, res) => {
    const userLoginData = req.body; // user filled in email and password field
    try {
        // Check if user exists
        const user = await User.userExists(userLoginData);
        if (!user) {
            return res.status(404).send('User does not exist');
        }
        const loginSuccess = await User.loginUser(userLoginData);
        if (!loginSuccess) {
            console.log('Login failed: Invalid email or password');
            return res.status(404).send('Invalid email or password');
        }
        res.status(200).json(loginSuccess);
    } catch (error) {
        console.error('Server error:', error); // Log error details
        res.status(500).send('Server error');
    }
};

const updateUser = async (req, res) => {
    const userId = parseInt(req.params.id);
    const newUserData = req.body;
    try {
        // get the current user 
        const user = await User.getUserById(userId);
        if (!user) {
            return res.status(404).send('User does not exist');
        }

        if (newUserData.newPassword) {
            // compare current password and the password in the database 
            if (!newUserData.currentPassword) {
                return res.status(400).json({ message: 'Current password is required to set a new password' });
            }
            const isPasswordMatch = await bcrypt.compare(newUserData.currentPassword, user.password);
            if (!isPasswordMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
        }

        const updatedUser = await User.updateUser(userId, newUserData);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Server error:', error); // Log error details
        res.status(500).send('Server error');
    }
};


// after implementing the basics i want to prompt user to enter password before account is actually deleted
const deleteUser = async (req, res) => {
    const userId = parseInt(req.params.id);
    const passwordInput = req.body;
    try {
        const checkUser = await User.getUserById(userId);
        if (!checkUser) {
            return res.status(404).send('User does not exist');
        }

        // compare current password and the password in the database 
        const isPasswordMatch = await bcrypt.compare(passwordInput.password, checkUser.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Password is incorrect' });
        }

        await User.deleteUser(userId);
        res.status(200).send('User successfully deleted');
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Server error');
    }
};

module.exports = {
    getUserById,
    createUser,
    loginUser,
    updateUser,
    deleteUser
};