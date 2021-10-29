const mongoose = require("mongoose")

const gameSchema = new mongoose.Schema({
    players: {
        type: Map,
        of: String
    },
    matchNumber:Number,
    maxStars: Number,
    fen : String,
    history:[String],
    private: Boolean,
    terminated: Boolean,
    winner:String
})
module.exports = mongoose.model("Game", gameSchema)