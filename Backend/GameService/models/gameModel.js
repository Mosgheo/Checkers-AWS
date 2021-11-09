const mongoose = require("mongoose")

const gameSchema = new mongoose.Schema({
    game_id: {
        type: mongoose.Schema.ObjectId,
        required: true
      },
    white: String,
    black: String,
    maxStars: Number,
    fen : String,
    history:[String],
    finished: Boolean,
    winner:String,
    turn:String
})
module.exports = mongoose.model("Game", gameSchema)