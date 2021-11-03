const Draughts = require('draughts').draughts
const Game = require('../models/gameModel')
const User = require('../models/userModel')
const dotenv = require("dotenv")

var lobbies = new Map(); // lobbyID -> draughtsInstance

var last_white_pieces = new Map() //lobbyID -> { pieceColor -> moves }
var last_black_pieces = new Map() //lobbyID -> { pieceColor -> moves }

/**TODO
 * ** MAJOR CONCERN: I'm sending responses to the one who asks, what about
 * the other player??
 * 
 *  - win handling (how do I send to both?)
 *  - turn handling
 *  - saving game when things go bad
 *  - leaveGame

 */
/**
 ** 
 **
 ** GAME HANDLING  
 **
 **
 */

async function winCheck(game_id){
    var game = lobbies.get(game_id)
    if(game.fen.split(':')[1].split[','].length <= 1){
        return [game.header()["BLACK"],game.header()["WHITE"]]
    }
    if(game.fen.split(':')[2].split[','].length <= 1 ){
        return [game.header()["WHITE"],game.header()["BLACK"]]
    }
    return null
}
/** to be called when something goes wrong and someone crashes,
 * need to stop the game and save its state
 */
async function saveGame(game_id) {
    let game = lobbies.get(game_id)
    history = game.history();
    fen = game.fen()
    Game.findOneAndUpdate({"game_id":game_id},{
        $set: {
            history:game_history,
            fen:fen}})
    
}
async function gameEnd(game_id,tie,winner,loser){
    if(!tie){
        Game.findOneAndUpdate({"game_id":game_id},
        {$set: {
            history:game_history,
            fen:fen,
            finished: true,
            winner: winner}})
        lobbies.delete(game_id)
        last_black_pieces.delete(game_id)
        last_white_pieces.delete(game_id)
        return updatePoints(winner,process.env.WIN_STARS,loser,process.env.LOSS_STARS)
    }else{
        Game.findOneAndUpdate({"game_id":game_id},
        {$set: {
            history:game_history,
            fen:fen,
            finished: true,
            winner: "Game has been settled with a tie."}})
        lobbies.delete(game_id)
        last_black_pieces.delete(game_id)
        last_white_pieces.delete(game_id)
        return updatePoints(winner,process.env.TIE_STARS,loser,process.env.TIE_STARS)
    }
}
async function updatePoints(player1,points1,player2,points2){
    return User.findOneAndUpdate({"user_id":player1},{$inc: {stars:points1}}) 
    && User.findOneAndUpdate({"user_id":player2},{$inc: {stars:points2}})
}
async function getBoard(game_id){
    let data = []
    try{
        var game = lobbies.get(game_id)
        var white = getUsernameById(game.header('WHITE'))
        var black = getUsernameById(game.header('BLACK'))
        data.push(black,white,parseFEN(game.fen()))
        res.json(data)
    }catch{
        res.status(500).json({error: "Error while sending board."})
    }
}
exports.tieGame = async function(req,res){
    //WILL "_" BELOW WORK?
    gameEnd(req.params.id,true,_,_)
    res.status(200).send({message: "Game has been settled with a tie, each player will not earn nor lose stars"})
}
exports.leaveGame = async function(req,res){
    let game_id = req.params.id
    let game = lobbies.get(game_id)
    let quitter = req.params.player_id;
    let winner;
    if(game.header('WHITE') === quitter){
        winner = game.header('BLACK')
    }else{
        winner = game.header('WHITE')
    }
    gameEnd(game_id,false,winner,quitter)
    res.status(200).send({message: "You successfully left the game, "+process.env.LOSS_STARS+" stars has been added to your profile"})

}
exports.movePiece = async function(req,res){
    let game_id = req.params.game_id
    if(!lobbies.has(game_id)){
        res.status(400).send({message: "Can't find such game"})
    }
    var game = lobbies.get(game_id)
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
    let data = lobbies.get(req.params.game_id).history();
    res.json(data);
}

/**
 ** 
 **
 ** LOBBY HANDLING  
 **
 **
 */ 

async function addPlayer(game_id, player2) {
    var game = lobbies.get(game_id)
    try{
        Game.findOneAndUpdate(
            { "game_id": game_id}, 
            { $set: 
                { black :player2,
                    fen: game.fen()
            }})
        game.header('BLACK', player2);
    }catch{
        console.log("Error while adding a player to a game.")
        throw new Error('Error while creating game.');
    }
}
async function delete_lobby(game_id){
    let deleted = await Game.findOneAndDelete({"game_id":game_id,"black":""})
        return deleted && lobbies.delete(game_id) 
        && last_black_pieces.delete(game_id)
        && last_white_pieces.delete(game_id) 
}
exports.joinLobby = async function(req,res) {
    let game_id = req.params.game_id
    let player2 = req.params.player2
    if(addPlayer(game_id,player2)){
        //right now i send the board to the one who joined the lobby, what about the other?
        res.status(200).json(getBoard(game_id));
    }else{
        res.status(400).send({message: "Something went wrong while joining this lobby"})
    }

}

/**
 * NEED TO  GET ALL GAMES WITH STARS < MY_STARS*/
exports.getLobbies = async function(req,res){
    let data = []
    let user_stars = req.params.stars
    let games = await Game.find({opponent : "", maxStars: {$gte : user_stars}})
    for(let i =0;i<games.length;i++){
        let availableGame = games[i]
        data.push([availableGame.game_id,availableGame.white,availableGame.maxStars])
    }
    res.status(200).json(data)
}

exports.build_lobby = async function(req,res){
    let playerId = req.params.game_params.white
    for (var entry of lobbies.entries()) {
        var gameIstance = entry[1];
       if(gameIstance.header['WHITE'] === playerId
            || gameIstance.header['BLACK'] === playerId){
           res.status(400).send({message: "Can't be in two lobbies at the same time"})
       }
    }

    var new_game = new Game(req.body.game_params)
    new_game.save()

    //Dunno if new_game._id will work
    last_black_pieces.set(new_game._id,new Map())
    last_white_pieces.set(new_game._id,new Map())
    lobbies.set(new_game.id,new Draughts())
    lobbies.get(new_game.id).header('WHITE', new_game.white);
    //CHECK THISfindOneAndUpdate
    res.status(200).json(new_game._id)
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
            if(JSON.stringify(last_black_pieces.get(game_id).get(piece))!=JSON.stringify(moves)){
                black_pieces_with_moves.set(piece,moves)
                last_black_pieces.get(game_id).set(gameIdpiece,moves)
            }
        }else{
            black_pieces_with_moves.set(piece,moves)
            last_black_pieces.get(game_id).set(piece,moves)
        }
    }

    for (let i = 0; i < white_pieces.length; i++) {
        let piece = white_pieces[i]
        if(last_white_pieces.has(game_id) && last_white_pieces.get(game_id).has(piece)){
            let moves = game.getLegalMoves(piece)
            if(JSON.stringify(last_white_pieces.get(game_id).get(piece))!=JSON.stringify(moves)){
                white_pieces_with_moves.set(piece,moves)
                last_white_pieces.get(game_id).set(piece,moves)
            }
        }else{
            white_pieces_with_moves.set(piece,moves)
            last_white_pieces.get(game_id).set(piece,moves)
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