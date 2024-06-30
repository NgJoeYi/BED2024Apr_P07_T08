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


const checkUserExist = async (req, res) => {
    const { email } = req.body;
    try {
        const checkUser = await User.checkUserExist(email);
        if (!checkUser) {
            return res.status(404).send('User does not exist');
        }
        res.status(200).send(checkUser);
    } catch (error) {
        console.error('Server error:', error); // Log error details
        res.status(500).send('Server error');
    }
};


const createUser = async (req, res) => {
    const newUserData = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.checkUserExist(newUserData.email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
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
    const { email, password } = req.body; // user filled in email and password field
    try {
        const loginSuccess = await User.loginUser({ email });
        if (!loginSuccess) {
            return res.status(404).send( { message: 'Invalid email. No user found'} );
        }
        const matchPassword = await bcrypt.compare(password, loginSuccess.password);
        if (!matchPassword) {
            return res.status(404).json( { message: 'Invalid password. Please try again'} );
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

        // if there were changes made to the email, check if the email alr exists
        if (newUserData.email !== user.email) {
            const checkEmailExist = await User.checkUserExist(newUserData.email);
            if (checkEmailExist) {
                return res.status(400).json({ message: 'Email is already in use' });
            }
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
           profilePic = 'images/profilePic.jpeg'; // Default profile picture 
        }
        res.status(200).json({ user, profilePic });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Server error');
    }
};









module.exports = {
    getUserById,
    checkUserExist,
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