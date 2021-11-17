const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.ObjectId,
        required: true
    },
    username:String,
    stars: String,
    nationality:String,
    wins:Number,
    losses:Number,
    avatar: String,
    mail:String,
    password:String,
    salt:String
});

module.exports = mongoose.model("users", userSchema)