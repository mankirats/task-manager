const express = require("express");
const router = new express.Router();
const Task = require("../models/task");
const auth = require("../middleware/auth");

// Get All Tasks
router.get("/api/v1/task", async (req, res) => {
    const match = {};
    if (req.query.completed) {
        match.completed = req.query.completed === "true";
    }
    try {
        const allUsers = await Task.find(match)
            .sort({ createdAt: -1 })
            .limit(parseInt(req.query.limit))
            .skip(parseInt(req.query.skip));

        const totalUsers = await Task.countDocuments({});
        res.status(200).send({
            status: 200,
            total_tasks: totalUsers,
            list_of_tasks: allUsers,
        });
    } catch (err) {
        res.status(400).send({ status: 400, message: err.message });
    }
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
        res.status(400).send({ status: 400, message: err.message });
    }
});

// Create a Task
router.post("/api/v1/task", auth, async (req, res) => {
    try {
        const data = req.body;
        const userId = req.user._id;
        const newTask = new Task({ ...data, createdBy: userId });
        const result = await newTask.save();
        res.status(201).send({
            status: 201,
            message: "Task created successfully",
            data: result,
        });
    } catch (e) {
        res.status(400).send({
            status: 400,
            message: e.message,
        });
    }
});

// Update users using name
router.patch("/api/v1/updateTask/:id", auth, async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user._id;
        const updateTask = await Task.findByIdAndUpdate(
            { _id: taskId, createdBy: userId },
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
            message: err.message,
        });
    }
});

// Delete Task
router.delete("/api/v1/Task/:id", auth, async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user._id;
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
            data: err.message,
        });
    }
});

module.exports = router;
