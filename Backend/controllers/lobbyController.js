const Draughts = require('draughts').draughts
const Game = require('../models/gameModel')

var lobbies = new Map(); // lobbyID -> draughtsInstance
var last_white_pieces = new Map() //lobbyID -> { pieceColor -> moves }
var last_black_pieces = new Map() //lobbyID -> { pieceColor -> moves }

/*Attaches to every Piece on the board its list of available moves for frontend purposes.
* String is to be sent to client on the form of:
* let data = [TURN, Map(WHITE_PIECE->MOVES),Map(BLACK_PIECE->MOVES)]
* es: [B,WHITE(3->(5,10,3)10K->(5,2,5,4)),BLACK(4->(5,10)10K->(5,2))]
* OBV a draught that's not a king can only have max 2 moves.
*/
function parseFEN(game_id) {
    let data = []
    var game = lobbies.get(game_id)
    let fen = game.fen()
    var fields = fen.split(':')
    data.push(fields[0])
    var white_pieces = fields[1].split(',')
    var black_pieces = fields[2].split(',')
    white_pieces[0] = white_pieces[0].substring(1)
    black_pieces[0] = black_pieces[0].substring(1)
    var white_pieces_with_moves = new Map()
    var black_pieces_with_moves = new Map()

    for (let i = 0; i < black_pieces.length; i++) {
        let piece = black_pieces[i]
        if(last_black_pieces.has(game_id) && last_black_pieces.get(game_id).has(piece)){
            let moves = game.getLegalMoves(piece)
            if(JSON.stringify(last_black_pieces.get(piece))!=JSON.stringify(moves)){
                black_pieces_with_moves.set(piece,moves)
                last_black_pieces.set(piece,moves)
            }
        }else{
            black_pieces_with_moves.set(piece,moves)
            last_black_pieces.set(piece,moves)
        }
    }

    for (let i = 0; i < white_pieces.length; i++) {
        let piece = white_pieces[i]
        if(last_white_pieces.has(game_id) && last_white_pieces.get(game_id).has(piece)){
            let moves = game.getLegalMoves(piece)
            if(JSON.stringify(last_white_pieces.get(piece))!=JSON.stringify(moves)){
                white_pieces_with_moves.set(piece,moves)
                last_white_pieces.set(piece,moves)
            }
        }else{
            white_pieces_with_moves.set(piece,moves)
            last_white_pieces.set(piece,moves)
        }
    }

    data.push(white_pieces_with_moves)
    data.push(black_pieces_with_moves)
    return data
}

function winCheck(game_id){
    var game = lobbies.get(game_id)
    if(game.fen.split(':')[1].split[','].length <= 1){
        return "B"
    }
    if(game.fen.split(':')[2].split[','].length <= 1 ){
        return "W"
    }
    return null
}

async function addPlayer(game_id, player2) {
    var game = lobbies.get(game_id)
    try{
        game.header('BLACK', player2);
    }catch{
        console.log("Error while creating a game.")
        throw new Error('Error while creating game.');
    }
}

exports.getBoard = async function(req,res){
    let game_id = req.params.game_id
    let secondPlayerID = req.params.opponentId
    var game = lobbies.get(game_id)
    try{
        let data = []
        if(game.fen() != process.env.DEFAULT_FEN){
            data = parseFEN(game.fen())
            res.json(data)
        }else{
            await addPlayer(game_id,secondPlayerID)
            data = parseFEN(game.fen())
            res.json(data)
        }
    }catch{
        res.status(500).json({error: "Error while sending board."})
    }
}
exports.deleteBoard = async function(req,res){
    let game_id = req.params.game_id
    try{
        /**FIX THIS FIND AND UPDATE */
        Game.findOneAndUpdate(game_id).save();
        lobbies.delete(game_id)
        //CHECK IF OK
        res.status(200).json()
    }catch {
        res.status(500).json({error: e})
    }
}

exports.movePiece = async function(req,res){
    let game_id = req.params.game_id
    var game = lobbies.get(game_id)
    if(game.move(req.body.from+"-"+req.body.to) != null){
        let data = parseFEN(game_id)
        if(game.game_over()){
            let winner = winCheck();
            /**HANDLE WIN NOTIFICATION */
            if(winner != null){
                res.json({
                    winner: winner,
                    data: data
                })
            }else{
                /**HANDLE WHAT HAPPENS IF GAME OVER BUT NONE WON */
                res.json({
                    winner: winner,
                    data: data
                })
            }
        }else{
            res.json(data)
        }
    }else{
        res.status(400).json({error: "Error while making such move, you can try again or select a different move."})
    }
}
/**probably won't work */
exports.saveGame = async function(req,res){
    let game_id = req.params.game_id
    let game = lobbies.get(game_id)
    history = game.history();
    fen = game.fen()
    Game.findOneAndUpdate({id:game_id},{history:game_history,fen:fen})
}
exports.gameHistory = async function(req,res){
    let data = lobbies.get(req.params.game_id).history();
    res.json(data);
}

exports.build_lobby = async function(req,res){
    var new_game = new Game(req.params.game_params)
    new_game.save()
    //Dunno if new_game._id will work
    last_black_pieces.set(new_game._id,new Map())
    last_white_pieces.set(new_game._id,new Map())
    lobbies.set(new_game.id,new Draughts())
    //CHECK THIS
    let data = []
    res.status(200).json(data)
}
