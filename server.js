const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const User = require("./src/models/user.js");
require("./src/db/mongoose");
app.use(express.json());

app.get("/api/v1/user", (req, res) => {
    res.status(400).send({
        status: 200,
        message: "Users List requested",
    });
});

app.post("/api/v1/user", (req, res) => {
    const newUser = new User(req.body);
    newUser
        .save()
        .then(() => {
            res.status(200).send({
                status: 200,
                message: "New user Added",
                data: res.send(newUser),
            });
        })
        .catch((err) => {
            res.status(400).send({
                status: 400,
                message: `${err}`,
            });
        });
});

app.get("*", (req, res) => {
    res.status(400).send({
        status: 400,
        message: "Oops!, I think you are lost.",
    });
});

app.listen(port, () => {
    console.log("App is running on port -", port);
});
