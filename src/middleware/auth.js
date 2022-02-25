const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decodeToken = jwt.verify(token, "AS$%DF)(gh&^");
        const user = await User.findOne({
            _id: decodeToken.id,
            "tokens['token']": token,
        });
        if (!user) {
            throw new Error("Unable to Authenicate");
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(401).send({
            status: 401,
            message: "Please Authenticate.",
        });
    }
};

module.exports = auth;
