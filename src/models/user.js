const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");
const res = require("express/lib/response");
const { Timestamp } = require("mongodb");
// const auth = require("../middleware/auth");
const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        age: {
            type: Number,
            default: null,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            index: true,
            required: "Email address is required",
            // validate: [validateEmail, "Please fill a valid email address"],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please fill a valid email address",
            ],
        },
        password: {
            type: String,
            required: true,
            minLength: 6,

            validate(value) {
                if (value.toLowerCase().includes("password")) {
                    throw new Error("Please use a strong password");
                }
            },
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        avatar: {
            type: Buffer,
        },
    },
    { timestamps: true }
);

userSchema.statics.findByCredentials = async (userEmail, userPassword) => {
    const user = await User.findOne({ email: userEmail });

    if (!user) {
        throw new Error("Credentials provided are incorrect. Please try again");
    }

    const isMatch = await bcrypt.compare(userPassword, user.password);

    if (!isMatch) {
        throw new Error("Credentials provided are incorrect. Please try again");
    }

    return user;
};

userSchema.virtual("allTasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "createdBy",
});

userSchema.methods.toJSON = function () {
    const user = this;
    const modUser = user.toObject();
    delete modUser.password;
    delete modUser.tokens;
    delete modUser.avatar;

    return modUser;
};

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ id: user._id.toString() }, "AS$%DF)(gh&^");
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

userSchema.methods.verifyAuthToken = async function (reqToken) {
    const token = jwt.verify(reqToken, "AS$%DF)(gh&^");
    return token;
};

userSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

userSchema.pre("deleteOne", async function (next) {
    const user = this;
    try {
        const userId = await User.findOne({ id: user._id });
        const result = await Task.deleteMany({
            createdBy: userId,
        });
    } catch (err) {
        console.log(err.message);
    }
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
