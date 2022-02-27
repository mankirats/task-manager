const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const { user } = require("fontawesome");
// Get all users
const listAndCount = async (collection) => {
    // throw new Error("mklmkl");
    const allUsers = await collection.find({});

    const totalUsers = await collection.countDocuments({});

    return (result = { allUsers, totalUsers });
};

router.get("/api/v1/user", async (req, res) => {
    const result = await listAndCount(User);
    res.status(200).send({
        status: 200,
        total_users: result["totalUsers"],
        list_of_users: result["allUsers"],
    });
});

router.post("/api/v1/userprofile", auth, async (req, res) => {
    try {
        let user = req.user;
        res.status(200).send({
            status: 200,
            data: user,
        });
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: err.message,
        });
    }
});

// Create a user
router.post("/api/v1/user", async (req, res) => {
    const newUser = new User(req.body);
    try {
        const user = await newUser.save();
        user.generateAuthToken();
        res.status(201).send({
            status: 201,
            message: "New user Added",
            data: user,
            generatedToken: user.tokens[user.tokens.length - 1].token,
        });
    } catch (e) {
        res.status(400).send({
            status: 400,
            message: `${e}`,
        });
    }
});

// Update users using name
router.patch("/api/v1/updateUser", auth, async (req, res) => {
    try {
        const user = req.user;
        const updates = Object.keys(req.body);
        updates.forEach((update) => (user[update] = req.body[update]));
        await user.save();
        if (!user) {
            return res.status(400).send({
                status: 400,
                data: "invalid user id",
            });
        }
        res.status(200).send({
            status: 200,
            data: user,
        });
    } catch (e) {
        res.status(400).send({
            status: 400,
            message: e.message,
        });
    }
});

// Delete User
router.delete("/api/v1/deleteUser", auth, async (req, res) => {
    try {
        const removeUser = await User.deleteOne({ _id: req.user._id });
        if (!removeUser) {
            return res.status(400).send({
                status: 400,
                data: "invalid user id",
            });
        }
        res.status(200).send({
            status: 200,
            data: "User successfully deleted",
        });
    } catch (err) {
        res.status(400).send({
            status: 400,
            data: err,
        });
    }
});

// User login
router.post("/api/v1/user/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        const token = await user.generateAuthToken();
        res.status(200).send({
            status: 200,
            message: "User successfully logged in",
            data: user,
            generatedToken: token,
        });
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: err.message,
        });
    }
});

// Logout user from single device
router.post("/api/v1/user/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((userTokens) => {
            return userTokens.token !== req.token;
        });
        await req.user.save();
        res.status(200).send({
            status: 200,
            message: "User logged out successfully",
        });
    } catch (err) {
        res.status(500).send({
            status: 500,
            message: "User authentication failed",
        });
    }
});

router.post("/api/v1/user/allDevicesLogout", auth, async (req, res) => {
    try {
        req.user.tokens.splice(0, req.user.tokens.length);
        await req.user.save();
        res.status(200).send({
            status: 200,
            message: "User logged out successfully from all the devices",
        });
    } catch (err) {
        res.status(500).send({
            status: 500,
            message: "User authentication failed",
        });
    }
});

module.exports = router;
