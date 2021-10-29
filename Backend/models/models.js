const mongoose = require("mongoose")

//const Piece  = mongoose.model('Piece', pieceModel);

const pieceSchema = new mongoose.Schema({
    moves: [String],
    isKing: Boolean,
    color: String
})

const cellSchema = new mongoose.Schema({
    position: {
        type: Number,
        required: true
    },
    piece: Piece,
    targeted: {
        type: Boolean
    }
})

module.exports = mongoose.model("Cell", cellSchema)
module.exports = mongoose.model("Piece", pieceSchema)