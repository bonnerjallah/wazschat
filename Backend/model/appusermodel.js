const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true 
    },
    username: {
        type: String,
        required: true,
        unique: true 
    },
    pwd: {
        type: String,
        required: true
    },
    profilePic: {
        type: String
    },
    bio:{
        type: String
    }
    
}, {collection: "appusers"});

const AppUser = mongoose.model("AppUser", userSchema);

module.exports = AppUser;
