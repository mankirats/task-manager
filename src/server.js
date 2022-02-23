const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const User = require("./models/user.js");
const Task = require("./models/task");
const res = require("express/lib/response");
const { response } = require("express");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
require("./db/mongoose");

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

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
