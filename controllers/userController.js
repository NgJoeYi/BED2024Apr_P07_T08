const User = require('../models/User');
const bcrypt = require('bcrypt');

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

module.exports = {
    createUser,
    loginUser
};