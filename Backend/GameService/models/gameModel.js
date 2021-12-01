const mongoose = require("mongoose")

const gameSchema = new mongoose.Schema({
    game_id: {
        type: mongoose.Schema.ObjectId,
        required: true
      },
    fen : String,
    history:[String],
    winner:String,
    loser:String
})
module.exports = mongoose.model("games", gameSchema)