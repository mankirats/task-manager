const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const User = require("./src/models/user.js");
const Task = require("./src/models/task");
const res = require("express/lib/response");
require("./src/db/mongoose");

app.use(express.json());

// Get all users
app.get("/api/v1/user", (req, res) => {
    User.find({})
        .then((result) => {
            res.send({
                status: 200,

                data: result,
            });
        })
        .catch((err) => res.send(err));
});

// Create a user
app.post("/api/v1/user", (req, res) => {
    const newUser = new User(req.body);
    newUser
        .save()
        .then(() => {
            res.status(201).send({
                status: 201,
                message: "New user Added",
                data: newUser,
            });
        })
        .catch((e) => {
            res.status(400).send({
                status: 400,
                message: `${e}`,
            });
        });
});

// Get user using name
app.get("/api/v1/user/:uname", (req, res) => {
    let { uname } = req.params;
    User.find({ name: uname })
        .then((result) => {
            res.send({
                status: 200,

                data: result,
            });
        })
        .catch((err) => res.send(err));
});

// Get All Tasks
app.get("/api/v1/task", (req, res) => {
    Task.find({})
        .then((result) => {
            res.send({
                status: 200,
                data: result,
            });
        })
        .catch((err) => res.send(err));
});

app.get("/api/v1/task/:tname", (req, res) => {
    let { tname } = req.params;
    Task.find({ description: tname })
        .then((result) => {
            res.send({
                status: 200,

                data: result,
            });
        })
        .catch((err) => res.send(err));
});

// Create a Task
app.post("/api/v1/task", (req, res) => {
    const newTask = new Task(req.body);
    newTask
        .save()
        .then(() => {
            res.status(201).send({
                status: 201,
                message: "Task created successfully",
                data: newTask,
            });
        })
        .catch((e) => {
            res.status(400).send({
                status: 400,
                message: e,
            });
        });
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
