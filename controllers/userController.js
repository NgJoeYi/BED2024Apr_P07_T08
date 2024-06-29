const User = require('../models/User');
const bcrypt = require('bcrypt');
const Lectures = require("../models/Lectures");

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
        const existingUser = await User.loginUser({ email: newUserData.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(newUserData.password, 10);
        newUserData.password = hashedPassword; // Replace plain text password with hashed password  

        const newUser = await User.createUser(newUserData); 
        if (!newUser) {
            console.error('Error: User creation failed');
            return res.status(400).json({ message: 'Could not create an account' });
        }
        res.status(201).json({ userId: newUser.id });
    } catch (error) {
        console.error('Server error:', error); // Log error details
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.loginUser({ email, password });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Save user ID in session
        req.session.userId = user.id;

        if (user.role === 'lecturer') {
            const lecturer = await User.getLecturerByUserId(user.id);
            req.session.lecturerID = lecturer.LecturerID;
        }

        res.json(user);
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
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
            if (!newUserData.currentPassword) {
                return res.status(400).json({ message: 'Current password is required to set a new password' });
            }
            const isPasswordMatch = await bcrypt.compare(newUserData.currentPassword, user.password);
            if (!isPasswordMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            newUserData.password = await bcrypt.hash(newUserData.newPassword, 10);
        } else {
            newUserData.password = user.password;
        }

        const updatedUser = await User.updateUser(userId, {
            name: newUserData.name || user.name,
            email: newUserData.email || user.email,
            dob: newUserData.dob || user.dob,
            password: newUserData.password
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Server error:', error); // Log error details
        res.status(500).send('Server error');
    }
};

// after implementing the basics i want to prompt user to enter password before account is actually deleted (edit: done)
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
        res.status500.send('Server error');
    }
};

const updateProfilePic = async (req, res) => {  
    const userId = parseInt(req.params.id);
    const { profilePic } = req.body;

    try {
        const updatedProfilePic = await User.updateProfilePic(userId, profilePic);
        if (!updatedProfilePic) {
            return res.status(400).send('Failed to update profile picture');
        }
        res.status(200).json(updatedProfilePic);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Server error');
    }
};


const getProfilePicByUserId = async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        const user = await User.getUserById(userId);
        if (!user) {
            return res.status(404).send('User does not exist');
        }

        let profilePic = await User.getProfilePicByUserId(userId);
        if (!profilePic) {
           profilePic = 'images/profilePic.jpeg'; // Default profile picture 
        }
        res.status(200).json({ user, profilePic });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Server error');
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const userId = req.session.userId; // using session
        const user = await User.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ message: 'Server error' });
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
