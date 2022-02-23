const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const userRouter = require("./routers/userRouter");
const taskRouter = require("./routers/taskRouter");
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
