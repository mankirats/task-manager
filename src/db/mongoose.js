const mongoose = require("mongoose");

const url = "mongodb://127.0.0.1:27017";

const db = "task-manager";

mongoose.connect(`${url}/${db}`, {
    useNewUrlParser: true,
});

const User = mongoose.model("User", {
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes("password")) {
                throw new Error("Please use a strong password");
            }
        },
    },
});

const newUser = new User({
    name: "Jennifer",
    age: "29",
    password: "Hello123",
});

newUser
    .save()
    .then(() => {
        console.log("User saved successfully");
    })
    .catch((err) => {
        console.log("Error!", err);
    });

const Task = mongoose.model("Task", {
    description: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
});

const newTask = new Task({
    description: "Play",
    completed: false,
});

newTask
    .save()
    .then(() => {
        console.log("Task log saved successfully");
    })
    .catch((err) => {
        console.log("Error!", err);
    });
