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
    const allUsers = await collection
        .find({})
        .catch((e) => console.log("Error: ", e.message));
    const totalUsers = await collection
        .countDocuments({})
        .catch((e) => console.log("Error: ", e.message));
    return { allUsers, totalUsers };
};

app.get("/api/v1/user", async (req, res) => {
    try {
        await listAndCount(User).then((result) => {
            res.status(200).send({
                status: 200,
                total_users: result["totalUsers"],
                list_of_users: result["allUsers"],
            });
        });
    } catch (e) {
        res.status(400).send({
            status: 400,
            // message: message.e,
        });
        console.log(e);
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
        await getUser.then((result) => {
            res.send({
                status: 200,
                data: result,
            });
        });
    } catch (err) {
        res.send(err);
    }
});

// Create a user
app.post("/api/v1/user", async (req, res) => {
    const newUser = new User(req.body);
    try {
        await newUser.save().then(() => {
            res.status(201).send({
                status: 201,
                message: "New user Added",
                data: newUser,
            });
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
    await listAndCount(Task).then((result) => {
        res.status(200).send({
            status: 200,
            total_users: result["totalUsers"],
            list_of_users: result["allUsers"],
        });
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
