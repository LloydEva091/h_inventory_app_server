const User = require('../models/User');
const Stock = require('../models/Stock');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    // get all user data without the method (cause of lean) and without password (cause of select -password)
    const users = await User.find().select('-password').lean();
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' });
    }
    res.json(users);
});

// @desc Create a new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { email, name, password, roles } = req.body;

    // Confirm Data
    if (!email) {
        return res.status(400).json({ message: 'Email field are required' });
    } else if (!name) {
        return res.status(400).json({ message: 'Name field are required' });
    } else if (!password) {
        return res.status(400).json({ message: 'Password field are required' });
    } else if (!roles) {
        return res.status(400).json({ message: 'Roles field are required' });
    }


    let userLowerCase = email.toLowerCase();
    // Check for duplicate
    const duplicate = await User.findOne({ email: userLowerCase }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate Email' });
    }

    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

    const userObject = { "email": userLowerCase, "password": hashedPwd, name, roles };

    // Create and store new user
    const user = await User.create(userObject);

    //created
    if (user) {
        res.status(201).json({ message: `New user ${userLowerCase} created` });
    } else {
        res.status(400).json({ message: 'Invalid user data received' });
    }
});

// @desc Update a new user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
    const { id, email, name, roles, active, password } = req.body;

    // Confirm Data
    if (!email) {
        return res.status(400).json({ message: 'Email field are required' });
    } else if (!name) {
        return res.status(400).json({ message: 'Name field are required' });
    } else if (!active) {
        return res.status(400).json({ message: 'Active field are required' });
    } else if (!roles) {
        return res.status(400).json({ message: 'Roles field are required' });
    }

    const user = await User.findById(id).exec();

    // If there is no user
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Check Duplicate
    const duplicate = await User.findOne({ email }).lean().exec();

    // Allow update to the original user
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ mesasge: 'Duplicate Email' });
    }

    user.email = email;
    user.name = name;
    user.roles = roles;
    user.active = active;

    if (password) {
        //Hash password
        user.password = await bcrypt.hash(password, 10)// salt rounds
    }

    const updatedUser = await user.save();

    res.json({ message: `${updatedUser.email} updated` });
});

// @desc Delete a new user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body;

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' });
    }

    // Does the user still have assigned stocks?
    const stock = await Stock.findOne({ user: id }).lean().exec();
    if (stock) {
        return res.status(400).json({ message: 'User has assigned stocks' });
    }

    const user = await User.findById(id).exec();

    // Does the user exist to delete?
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    const result = await user.deleteOne();

    const reply = `User ${result.email} with ID ${result._id} deleted`;

    res.json(reply);
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}