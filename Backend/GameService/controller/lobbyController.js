const Draughts = require('draughts').draughts
const Game = require('../models/gameModel')
const User = require('../models/userModel')
const dotenv = require("dotenv")

var games = new Map(); // game_id -> game
     /*      game: {
                white: "",
                black: "",
                draughts: null,
                finished: false,
                last_white_pieces: { piece -> moves }
                last_black_pieces: { piece -> moves }
                fen: "",
                winner: "",
                turn:
                tick: 0
            }
     */

//var last_white_pieces = new Map() //game_id -> { piece -> moves }
//var last_black_pieces = new Map() //game_id -> { piece -> moves }

/**
 ** 
 **
 ** GAME HANDLING  
 **
 **
 */

async function winCheck(game_id){
    let gameInstance = games.get(game_id)
    var game = gameInstance.draughts
    if(game.fen.split(':')[1].split[','].length <= 1){
        return [gameInstance.black,gameInstance.white]
    }
    if(game.fen.split(':')[2].split[','].length <= 1 ){
        return [gameInstance.white,gameInstance.black]
    }
    return null
}
/** to be called when something goes wrong and someone crashes,
 * need to stop the game and save its state
 */
async function saveGame(game_id) {
    let game = games.get(game_id).draughts
    history = game.history();
    fen = game.fen()
    Game.findOneAndUpdate({"game_id":game_id},{
        $set: {
            history:game_history,
            fen:fen}})
    
}
async function gameEnd(game_id,tie,winner,loser){
    let lobby = games.get(game_id)
    if(!tie){
        Game.findOneAndUpdate({"game_id":game_id},
        {$set: {
            history:game_history,
            fen:fen,
            finished: true,
            winner: winner}})
        games.delete(game_id)
        //last_black_pieces.delete(game_id)
        //last_white_pieces.delete(game_id)
        return updatePoints(winner,process.env.WIN_STARS,loser,process.env.LOSS_STARS)
    }else{
        Game.findOneAndUpdate({"game_id":game_id},
        {$set: {
            history:game_history,
            fen:fen,
            finished: true,
            winner: "Game has been settled with a tie."}})
        games.delete(game_id)
        //last_black_pieces.delete(game_id)
        //last_white_pieces.delete(game_id)
        return updatePoints(lobby.white,process.env.TIE_STARS,lobby.black,process.env.TIE_STARS)
    }
}
async function updatePoints(player1,points1,player2,points2){
    return User.findOneAndUpdate({"user_id":player1},{$inc: {stars:points1}}) 
    && User.findOneAndUpdate({"user_id":player2},{$inc: {stars:points2}})
}

exports.tieGame = async function(req,res){
    //WILL "_" BELOW WORK?
    if(gameEnd(req.params.id,true,_,_)){
        res.status(200).send({message: "Game has been settled with a tie, each player will not earn nor lose stars"})
    }else{
        res.status(500).send({message: "Something went wrong while closing the game."})
    }

}
exports.leaveGame = async function(req,res){
    let game_id = req.params.id
    let gameInstance = games.get(game_id)
    let quitter = req.params.player_id
    if(gameInstance.white === quitter){
        gameEnd(game_id,false,gameInstance.black,gameInstance.white)
    }else{
        gameEnd(game_id,false,gameInstance.white,gameInstance.black)
    }
    let data = []
    data.push( "You successfully left the game!\n "+process.env.LOSS_STARS+" stars have been removed from your profile!");
    data.push( "The opponent has left the game!\n "+process.env.WIN_STARS+" stars have been added to your profile")
    res.status(200).send(data)

}
exports.movePiece = async function(req,res){
    let game_id = req.params.game_id
    if(!games.has(game_id)){
        res.status(400).send({message: "Can't find such game"})
    }
    var game = games.get(game_id).draughts
    if(game.move(req.body.from+"-"+req.body.to) != null){
        let data = parseFEN(game_id)
        if(game.game_over()){
            let result = winCheck();
            /**HANDLE WIN NOTIFICATION */
            if(winner != null){
                gameEnd(game_id,false,result[0],result[1])
                res.json({
                    winner: getUsernameById(result[0]),
                    data: data
                })
            }else{
                /**HANDLE WHAT HAPPENS IF GAME OVER BUT NONE WON */
            }
        }else{
            res.json(data)
        }
    }else{
        res.status(400).json({error: "Error while making such move, you can try again or select a different move."})
    }
}

exports.gameHistory = async function(req,res){
    let data = games.get(req.params.game_id).draughts.history();
    res.json(data);
}



exports.create_game = async function(req,res){
    let game_id = req.params.game_id
    let host_id = req.params.host_id
    let opponent = req.params.opponent
    var new_game = new Object();
    game.white = host_id
    game.black = opponent
    game.draughts = new Draughts()
    game.finished = false;
    game.last_white_pieces = new Map()
    game.last_black_pieces = new Map()
    game.fen = game.draughts.fen()
    game.winner = ""
    game.turn = ""
    games.set(game_id,new_game)
    res.status(200).json(parseFEN(game_id))
}
exports.delete_lobby = async function(req,res){
    let deleted = delete_lobby(req.params.game_id)
    if(deleted == 1){
        res.status(200).json();
    }else{
        res.status(400).send({message: "Couldn't delete such lobby, it either was already deleted or the game is still running"});
    }
}

exports.get_old_games = async function(req,res){
    //TODO
}
exports.restart_old_game = async function(req,res){
    //TODO
}

/**
 ** 
 **
 ** UTILITIES
 **
 **
 */

/*Attaches to every Piece on the board its list of available moves for frontend purposes.
* String is to be sent to client on the form of:
* let data = [TURN, Map(WHITE_PIECE->MOVES),Map(BLACK_PIECE->MOVES)]
* es: [B,WHITE(3->(5,10,3)10K->(5,2,5,4)),BLACK(4->(5,10)10K->(5,2))]
* OBV a draught that's not a king can only have max 2 moves.
*/
function parseFEN(game_id) {
    let data = []
    var game = games.get(game_id).draughts
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
        if(last_black_pieces.has(piece)){
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
        if(last_white_pieces.has(piece)){
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
function getUsernameById(user_id){
    let user = User.findOne({id: user_id})
    if (user!= null){
        return user.username
    }else{
        return "null"
    }
}