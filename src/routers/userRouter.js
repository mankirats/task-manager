const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const multer = require("multer");
const res = require("express/lib/response");
const upload = multer({ dest: "uploads/", storage: multer.memoryStorage() });

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
            data: err.message,
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

router.post("/api/v1/listTasks", auth, async (req, res) => {
    const user = req.user;
    await user.populate("allTasks");
    res.send(user.allTasks);
});

router.post(
    "/api/v1/user/addProfilePic",
    auth,
    upload.single("profilePic"),
    async (req, res) => {
        req.user.avatar = req.file.buffer;
        await req.user.save();
        res.send(req.user);
    },
    (error, req, res, next) => {
        res.status(400).send(error.message);
    }
);

router.get("/api/v1/user/profilePic", async (req, res) => {
    try {
        const user = await User.findOne({ _id: "6220f65a2e2b6471b7f0b324" });
        if (!user) {
            console.log("user");
            throw new Error("No user");
        }
        if (!user.avatar) {
            console.log("pic");
            throw new Error("No Avatar");
        }

        res.set("Content-Type", "image/jpg");
        res.send(user.avatar);
        // res.send(user);
    } catch (err) {
        res.send(err.message);
    }
});

module.exports = router;
