const mongoose = require("mongoose")

const playerSchema = new mongoose.Schema({
    playerID: {
        type: String,
        required: true
    },
    username:String,
    stars: String,
    nationality:String,
    wins:Number,
    losses:Number
});

module.exports = mongoose.model("player", playerSchema)