const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

/**
 * @swagger
 * /users/current:
 *   get:
 *     summary: Retrieve the currently logged-in user by ID
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User does not exist
 *       500:
 *         description: Server error
 */
const getUserById = async (req, res) => {
    //const userId = parseInt(req.params.id);
    const userId = req.user.id;
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

/*
// Commented out function
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
*/

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *       400:
 *         description: Email is already in use or could not create an account
 *       500:
 *         description: Server error
 */
const createUser = async (req, res) => {
    const newUserData = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.getUserByEmail(newUserData);
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
        res.status(201).json({ userId: newUser.id });
    } catch (error) {
        console.error('Server error:', error); // Log error details
        res.status(500).send('Server error');
    }
};

// --------------------------------------- JWT ---------------------------------------
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 *                 userId:
 *                   type: integer
 *       404:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body; // user filled in email and password field
    try {
        // if (!password) {
        //     return res.status(400).json({ message: 'Please enter your password' });
        // }

        const loginSuccess = await User.getUserByEmail({ email });
        if (!loginSuccess) {
            return res.status(404).send( { message: 'Invalid email. No user found'} );
        }
        const matchPassword = await bcrypt.compare(password, loginSuccess.password);
        if (!matchPassword) {
            return res.status(404).json( { message: 'Invalid password. Please try again'} );
        }

        const payload = {
            id: loginSuccess.id,
            role: loginSuccess.role,
        };
        const token = jwt.sign(payload, process.env.SECRET_TOKEN, { expiresIn: '3600s' });
        res.status(200).json({ token, role: loginSuccess.role,  userId: loginSuccess.id });
        //res.status(200).json(loginSuccess);
    } catch (error) {
        console.error('Server error:', error); // Log error details
        res.status(500).send('Server error');
    }
};
// --------------------------------------- JWT ---------------------------------------

/**
 * @swagger
 * /users:
 *   put:
 *     summary: Update the current user's information
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               dob:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Current password is required, email is already in use, or other validation errors
 *       404:
 *         description: User does not exist
 *       500:
 *         description: Server error
 */
const updateUser = async (req, res) => {
    const userId = req.user.id;
    const newUserData = req.body;
    try {
        // get the current user 
        const user = await User.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User does not exist' });
        }

        // if there were changes made to the email, check if the email alr exists
        if (newUserData.email !== user.email) {
            const checkEmailExist = await User.getUserByEmail(newUserData);
            if (checkEmailExist) {
                return res.status(400).json({ message: 'Email is already in use' }); // -- checked message appears
            }
        }

        if (newUserData.newPassword) {
            if (!newUserData.currentPassword) {
                return res.status(400).json({ message: 'Current password is required to set a new password' });
            }
            const isPasswordMatch = await bcrypt.compare(newUserData.currentPassword, user.password);
            if (!isPasswordMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' }); // -- checked message appears
            }
            if (newUserData.newPassword === newUserData.currentPassword) {
                return res.status(400).json({ message: 'New password cannot be the same as the current password' });
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


/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Delete the current user account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       204:
 *         description: Account deleted successfully
 *       400:
 *         description: Please enter your password or password is incorrect
 *       404:
 *         description: User does not exist
 *       500:
 *         description: Server error
 */
// after implementing the basics i want to prompt user to enter password before account is actually deleted (edit: done)
const deleteUser = async (req, res) => {
    const userId = req.user.id;
    const { password } = req.body;
    try {
        if (!password) {
            return res.status(400).json({ message: 'Please enter your password' }); // -- checked message appears
        }

        const checkUser = await User.getUserById(userId);
        if (!checkUser) {
            return res.status(404).json({ message: 'User does not exist' });
        }

        // Compare current password and the password in the database 
        const isPasswordMatch = await bcrypt.compare(password, checkUser.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Password is incorrect' }); // -- checked message appears
        }

        const deleteFK = await User.deleteUtility();
        if (!deleteFK) {
            return res.status(500).json({ message: 'Failed to delete user-related records' });
        }
        const userDeleted = await User.deleteUser(userId);
        if (!userDeleted) {
            return res.status(500).json({ message: 'Failed to delete user' });
        }
        res.status(204).json({ message: 'Account deleted successfully' }); // -- checked message appears
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @swagger
 * /users/profile-pic:
 *   put:
 *     summary: Update the profile picture of the currently logged-in user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profilePic:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profilePic:
 *                   type: string
 *       400:
 *         description: Failed to update profile picture
 *       500:
 *         description: Server error
 */
const updateProfilePic = async (req, res) => {
    const userId = req.user.id;
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

/**
 * @swagger
 * /users/profile-pic:
 *   get:
 *     summary: Get the profile picture of the currently logged-in user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Profile picture retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profilePic:
 *                   type: string
 *       404:
 *         description: User does not exist
 *       500:
 *         description: Server error
 */
const getProfilePicByUserId = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.getUserById(userId);
        if (!user) {
            return res.status(404).send('User does not exist');
        }

        let profilePic = await User.getProfilePicByUserId(userId);
        if (!profilePic) {
            profilePic = 'images/profilePic.jpeg'; // Default profile picture
        }
        res.status(200).json({ profilePic });
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
    getProfilePicByUserId
};

// ------------ KNOWLEDGE ATTAINED FROM BCRYPT ------------
// 1. hashing the password so if even 2 users have the same password, the hash value is different

// 2. bcrypt.hash(newUserData.newPassword, 10) the 10 in this is the level of security, 
// the higher the value, the more secure it is because it is the number of times hashing algo is executed
// it is known as salt rounds

// 3. bcrypt.compare(userLoginData.password, user.password) this bcrypt.compare 
// compares the plain text password and the hashed password, returns true if match, & false otherwise
