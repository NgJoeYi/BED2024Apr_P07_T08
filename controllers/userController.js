const User = require('../models/User');
const bcrypt = require('bcrypt');
const sql = require("mssql");
const dbConfig = require('../dbConfig');

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

const getCurrentUser = async (req, res) => {
    const userId = req.headers['user-id'];
    try {
        const user = await User.getUserById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).send('Server error');
    }
};

const createUser = async (req, res) => {
    const newUserData = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.loginUser(newUserData);
        if (existingUser) {
            return res.status(400).send('User already exists');
        } 
        // Hash the password
        const hashedPassword = await bcrypt.hash(newUserData.password, 10);
        newUserData.password = hashedPassword; // Replace plain text password with hashed password  
               
        const newUser = await User.createUser(newUserData); 
        if (!newUser) {
            console.error('Error: User creation failed');
            return res.status(400).json({ message: 'Could not create an account' });
        }
        res.status(201).json({ userId: newUser.userId });
    } catch (error) {
        console.error('Server error:', error); // Log error details
        res.status(500).send('Server error');
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.loginUser({ email });
        if (!user) {
            return res.status(404).send({ message: 'Invalid email. No user found' });
        }
        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            return res.status(404).json({ message: 'Invalid password. Please try again' });
        }

        // Fetch the LecturerID for the logged-in user
        const lecturerQuery = `
            SELECT LecturerID FROM Lecturer WHERE UserID = @userID
        `;
        const connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input('userID', sql.Int, user.id);
        const result = await request.query(lecturerQuery);
        const LecturerID = result.recordset[0]?.LecturerID;

        // Send user details and LecturerID to client
        res.status(200).json({ ...user, LecturerID });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Server error');
    }
};

const updateUser = async (req, res) => {
    const userId = parseInt(req.params.id);
    const newUserData = req.body;
    try {
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

const deleteUser = async (req, res) => {
    const userId = parseInt(req.params.id);
    const passwordInput = req.body;
    try {
        const checkUser = await User.getUserById(userId);
        if (!checkUser) {
            return res.status(404).send('User does not exist');
        }

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
           profilePic = 'images/profilePic.jpeg';
        }
        res.status(200).json({ user, profilePic });
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
    deleteUser,
    updateProfilePic,
    getProfilePicByUserId,
    getCurrentUser
};
