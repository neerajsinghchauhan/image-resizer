const mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// Using 'Collection1' explicitly for backwards compatibility with previous implementation
const User = mongoose.model("User", LoginSchema, "Collection1");

module.exports = User;
