const express = require("express");
const router = new express.Router();
const Task = require("../models/task");

// Get all users
const listAndCount = async (collection) => {
    // throw new Error("mklmkl");
    const allUsers = await collection.find({});

    const totalUsers = await collection.countDocuments({});

    return (result = { allUsers, totalUsers });
};

// Get All Tasks
router.get("/api/v1/task", async (req, res) => {
    const result = await listAndCount(Task);
    res.status(200).send({
        status: 200,
        total_tasks: result["totalUsers"],
        list_of_tasks: result["allUsers"],
    });
});

router.get("/api/v1/task/:tname", async (req, res) => {
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
router.post("/api/v1/task", async (req, res) => {
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
router.patch("/api/v1/task/:id", async (req, res) => {
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

// Delete Task
router.delete("/api/v1/Task/:id", async (req, res) => {
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

module.exports = router;
