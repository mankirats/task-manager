const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
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
        unique: true,
        trim: true,
        lowercase: true,
        unique: true,
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
});

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

userSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
// module.exports = findByCredentials;
