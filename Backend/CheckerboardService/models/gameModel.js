const mongoose = require("mongoose")

const gameSchema = new mongoose.Schema({
    players: [String,String],
    fen : String,
})

module.exports = mongoose.model("Game", gameSchema)