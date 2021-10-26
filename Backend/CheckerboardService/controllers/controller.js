const draughts = require('../utils/draughts').draughts
const Game = require('../models/gameModel')

exports.saveGame{
    let header = draughts.header();
    let fen = draughts.fen();
    try{
      const game = new Game(header["WHITE"]+"-"+header["BLACK"],fen).save();
    }catch{
        throw "error"
    }
}

//Attaches to every Piece on the board its list of available moves for frontend purposes.
function parseFEN(fen,color) {
    let data = []
    var fields = fen.split(':')
    if(draughts.turn() == color){
        data.push(true)
    }else{
        data.push(false)
    }
    var white_pieces = fields[1].split(',')
    var black_pieces = fields[2].split(',')
    black_pieces[0] = black_pieces[0].substring(1);
    white_pieces[0] = white_pieces[0].substring(1);
    for (let i = 0; i < white_pieces; i++) {
        black_pieces[i] = [black_pieces[i],draughts.getLegalMoves(black_pieces[i])]
    }
    for (let i = 0; i < white_pieces; i++) {
        white_pieces[i] = [white_pieces[i],draughts.getLegalMoves(white_pieces[i])]
    }
    data.push(white_pieces)
    data.push(black_pieces)
 
    return data
}

function winCheck(){
    if(draughts.fen.split(':')[1].split[','].length <= 1){
        return "B"
    }
    if(draughts.fen.split(':')[2].split[','].length <= 1 ){
        return "W"
    }
    return null
}

async function newGame(player1,player2) {
    try{
        draughts = draughts.Draughts()
        draughts.header('WHITE', player1);
        draughts.header('BLACK', player2);
    }catch{
        console.log("Error while creating a game.")
        throw new Error('Error while creating game.');
    }
}

exports.getBoard = async function(req,res){
    try{
        let data = []
        if(draughts.fen() != process.env.DEFAULT_FEN){
            data = parseFEN(draughts.fen())
            res.json(data)
        }else{
            await newGame(req.body.firstPlayerID,req.body.secondPlayerID)
            data = parseFEN(draughts.fen())
            res.json(data)
        }
    }catch{
        res.status(500).json({error: "Error while sending board."})
    }
}
exports.deleteBoard = async function(req,res){
    try{
        draughts.reset()
        res.json(parseFEN(draughts.fen()))
    }catch {
        res.status(500).json({error: e})
    }
}

exports.movePiece = async function(req,res){
    if(draughts.move(req.body.from+"-"+req.body.to) != null){
        if(draughts.game_over()){
            let winner = winCheck();
            if(winner != null){
                res.json({
                    winner: winner,
                    data: draughts.fen()
                })
            }else{
                res.json({
                    winner: winner,
                    data: parseFEN(draughts.fen())
                })
            }
        }else{
            res.json(parseFEN(draughts.fen()))
        }
    }else{
        res.status(400).json({error: "Error while making such move, you can try again or select a different move."})
    }
}