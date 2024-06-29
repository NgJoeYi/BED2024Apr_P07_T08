const User = require('../model/user');
const bcrypt = require('bcrypt');

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
    }

const createUser = async (req, res) => {
    const newUserData = req.body;
    try {
        const checkUser = await User.getUserByUsername(newUserData.username);
        if (!checkUser) {
            return res.status(400).send('User already exists');
        }
        const hashPassword = await bcrypt.hash(password, 10);
        newUserData.password = hashPassword;
        const user = await User.createUser(newUserData);
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
      }
    }


module.exports = { getUserById, createUser }
