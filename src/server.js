const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const User = require("./models/user.js");
const Task = require("./models/task");
const res = require("express/lib/response");
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
    let query = new RegExp(`.*${queryParam}.*`, "i");

    const getUser = User.find({
        $or: [{ name: query }, { password: query }],
    });

    try {
        const result = await getUser;
        res.status(200).send({
            status: 200,
            no_of_results: result.length,
            data: result,
        });
    } catch (err) {
        res.send(err);
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
    await Task.find({ description: query })
        .then((result) => {
            res.send({
                status: 200,
                data: result,
            });
        })
        .catch((err) => res.send(err));
});

// Create a Task
app.post("/api/v1/task", async (req, res) => {
    const newTask = new Task(req.body);
    const saveTask = await newTask.save();
    try {
        saveTask.then((newTask) => {
            res.status(201).send({
                status: 201,
                message: "Task created successfully",
                data: newTask,
            });
        });
    } catch (e) {
        res.status(400).send({
            status: 400,
            message: e,
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
