const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const User = require("./models/user.js");
const Task = require("./models/task");
const res = require("express/lib/response");
const { response } = require("express");
require("./db/mongoose");

app.use(express.json());

// Get all users
const listAndCount = async (collection) => {
    // throw new Error("mklmkl");
    const allUsers = await collection.find({});

    const totalUsers = await collection.countDocuments({});

    return (result = { allUsers, totalUsers });
};

app.get("/api/v1/user", async (req, res) => {
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
app.get("/api/v1/user/:queryParam", async (req, res) => {
    let { queryParam } = req.params;
    let queryName = new RegExp(`.*${queryParam}.*`, "i");
    let queryAge = isNaN(parseInt(queryParam)) ? 0 : parseInt(queryParam);
    const getUser = User.find({
        $or: [{ name: queryName }, { age: queryAge }],
    });

    try {
        const result = await getUser;
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
app.post("/api/v1/user", async (req, res) => {
    const newUser = new User(req.body);
    try {
        const result = await newUser.save();
        res.status(201).send({
            status: 201,
            message: "New user Added",
            data: result,
        });
    } catch (e) {
        res.status(400).send({
            status: 400,
            message: `${e}`,
        });
    }
});

// Get All Tasks
app.get("/api/v1/task", async (req, res) => {
    const result = await listAndCount(Task);
    res.status(200).send({
        status: 200,
        total_tasks: result["totalUsers"],
        list_of_tasks: result["allUsers"],
    });
});

app.get("/api/v1/task/:tname", async (req, res) => {
    let { tname } = req.params;
    let query = { $regex: new RegExp(tname), $options: "i" };
    try {
        let result = await Task.find({ description: query });
        res.status.send({
            status: 200,
            data: result,
        });
    } catch (err) {
        res.status(400).send({ status: 400, message: err });
    }
});

// Create a Task
app.post("/api/v1/task", async (req, res) => {
    const newTask = new Task(req.body);
    try {
        const result = await newTask.save();
        res.status(201).send({
            status: 201,
            message: "Task created successfully",
            data: result,
        });
    } catch (e) {
        res.status(400).send({
            status: 400,
            message: e,
        });
    }
});

// Update users using name
app.patch("/api/v1/user/:id", async (req, res) => {
    const objId = req.params.id;
    try {
        const updateUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
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

// Update users using name
app.patch("/api/v1/task/:id", async (req, res) => {
    const objId = req.params.id;
    try {
        const updateTask = await Task.findByIdAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updateTask) {
            return res.status(400).send({
                status: 400,
                message: "invalid Task id",
            });
        }
        res.status(200).send({
            status: 200,
            data: updateTask,
        });
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: err,
        });
    }
});

// Delete User
app.delete("/api/v1/user/:id", async (req, res) => {
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

// Delete Task
app.delete("/api/v1/Task/:id", async (req, res) => {
    try {
        const updateTask = await Task.findByIdAndDelete(req.params.id);
        if (!updateTask) {
            return res.status(400).send({
                status: 400,
                data: "invalid task id",
            });
        }
        res.status(200).send({
            status: 200,
            data: updateTask,
        });
    } catch (err) {
        res.status(400).send({
            status: 400,
            data: err,
        });
    }
});

// Route for all invalid requests
app.get("*", (req, res) => {
    res.status(400).send({
        status: 400,
        message: "Oops!, I think you are lost.",
    });
});

app.listen(port, () => {
    console.log("App is running on port -", port);
});
