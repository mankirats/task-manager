const mongoose = require("mongoose");

const User = mongoose.model("User", {
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        default: null,
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

module.exports = User;
