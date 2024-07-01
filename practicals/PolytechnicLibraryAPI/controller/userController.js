const User = require('../model/user');
const bcrypt = require('bcryptjs');

const getUserById = async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        const users = await User.getUserById(userId);
        if (!users) {
            return res.status(404).send('No users found');
        }
        res.status(200).json({ user_id, username, password, role });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const createUser = async (req, res) => {
    const newUserData = req.body;
    try {
        const checkUser = await User.getUserByUsername(newUserData.username);
        if (checkUser) {
            return res.status(400).send('User already exists');
        }
        const hashPassword = await bcrypt.hash(newUserData.password, 10);
        newUserData.passwordHash = hashPassword;
        await User.createUser(newUserData);
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.getUserByUsername(username);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordMatched = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordMatched) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const payload = {
            id: user.id,
            role: user.role,
        };
        const token = jwt.sign(payload, "your_secret_key", { expiresIn: '3600s' });

        return res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};



module.exports = { getUserById, createUser, login }