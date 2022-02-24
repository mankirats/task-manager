const e = require("express");
const express = require("express");
const { user } = require("fontawesome");
const router = new express.Router();
const User = require("../models/user");

// Get all users
const listAndCount = async (collection) => {
    // throw new Error("mklmkl");
    const allUsers = await collection.find({});

    const totalUsers = await collection.countDocuments({});

    return (result = { allUsers, totalUsers });
};

router.get("/api/v1/user", async (req, res) => {
    try {
        await listAndCount(User);
        res.status(200).send({
            status: 200,
            total_users: result["totalUsers"],
            list_of_users: result["allUsers"],
        });
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: err,
        });
    }
});

// Get user using name
router.get("/api/v1/user/:queryParam", async (req, res) => {
    let { queryParam } = req.params;
    let queryName = new RegExp(`.*${queryParam}.*`, "i");
    let queryAge = isNaN(parseInt(queryParam)) ? 0 : parseInt(queryParam);
    const getUser = User.find({
        $or: [{ name: queryName }, { age: queryAge }],
    });

    try {
        const result = await getUser;
        if (result.length == 0) {
            return res.status(400).send({
                status: 400,
                message: "No result found",
            });
        }
        res.status(200).send({
            status: 200,
            no_of_results: result.length,
            data: result,
        });
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: err,
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
        });
    } catch (e) {
        res.status(400).send({
            status: 400,
            message: `${e}`,
        });
    }
});

// Update users using name
router.patch("/api/v1/user/:id", async (req, res) => {
    const updates = Object.keys(req.body);
    // const userKeys = ['name','age','']
    try {
        const user = await User.findById(req.params.id);
        updates.forEach((update) => (user[update] = req.body[update]));
        await user.save();
        // const updateUser = await User.findByIdAndUpdate(
        //     req.params.id,
        //     req.body,
        //     { new: true, runValidators: true }
        // );
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
            message: e,
        });
    }
});

// Delete User
router.delete("/api/v1/user/:id", async (req, res) => {
    try {
        const updateUser = await User.findByIdAndDelete(req.params.id);
        if (!updateUser) {
            return res.status(400).send({
                status: 400,
                data: "invalid user id",
            });
        }
        res.status(200).send({
            status: 200,
            data: updateUser,
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
        });
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: err.message,
        });
    }
});

module.exports = router;
