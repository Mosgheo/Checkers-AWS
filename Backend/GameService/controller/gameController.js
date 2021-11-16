const Draughts = require('draughts').draughts
const Game = require('../models/gameModel')

var games = new Map(); // game_id -> game
     /*      game: {
                white: "",
                black: "",
                draughts: null,
                finished: false,
                last_white_pieces: { piece -> moves }
                last_black_pieces: { piece -> moves }
                winner: "",
                tick: 0
            }
     */

/**
 ** 
 **
 ** GAME HANDLING  
 **
 **
 */

function winCheck(game_id){
    let gameInstance = games.get(game_id)
    var game = gameInstance.draughts
    if(game.fen.split(':')[1].split[','].length <= 1){
        game.winner = gameInstance.black
        game.loser = gameInstance.white
        return true
    }
    if(game.fen.split(':')[2].split[','].length <= 1 ){
        game.winner = gameInstance.white
        game.loser = gameInstance.black
        return true
    }
    return false
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
    let game = games.get(game_id)
    game.winner = winner
    game.loser = loser
    if(!tie){
        await new Game({
            fen: game.draughts.fen(),
            history:getHistory(game_id),
            winner: winner,
            loser: loser 
        }).save()
        
        games.delete(game_id)

        //last_black_pieces.delete(game_id)
        //last_white_pieces.delete(game_id)
        //return updatePoints(winner,process.env.WIN_STARS,loser,process.env.LOSS_STARS)
    }else{
        await new Game({
            fen: game.draughts.fen(),
            history:getHistory(game_id),
            winner: "Game has been settled with a tie.",
            loser: game.loser
        }).save()
        games.delete(game_id)
        //last_black_pieces.delete(game_id)
        //last_white_pieces.delete(game_id)
        //return updatePoints(game.white,process.env.TIE_STARS,game.black,process.env.TIE_STARS)
    }
}
function getHistory(game_id){
    games.get(game_id).draughts.history({verbose:true});
}
exports.tieGame = function(req,res){
    //WILL "_" BELOW WORK?
    gameEnd(req.body.game_id,true,_,_).then(
        res.status(200).send({message: "Game has been settled with a tie, each player will not earn nor lose stars"})
    ).catch(
        res.status(500).send({message: "Something went wrong while closing the game."})
    )


}
exports.leaveGame = async function(req,res){
    let game_id = req.body.game_id
    if(games.has(game_id)){
        let game = games.get(game_id)
        let quitter = req.body.player_id
        if(game.white === quitter){
            gameEnd(game_id,false,gameInstance.black,gameInstance.white)
        }else{
            gameEnd(game_id,false,gameInstance.white,gameInstance.black)
        }
        let data = []
        data.push( "You successfully left the game!\n "+process.env.LOSS_STARS+" stars have been removed from your profile!");
        data.push( "The opponent has left the game!\n "+process.env.WIN_STARS+" stars have been added to your profile")
        res.status(200).send(data)
    }
}
exports.movePiece = function(req,res){
    let game_id = req.body.game_id
    if(!games.has(game_id)){
        res.status(400).send({message: "Can't find such game"})
    }else{
        var game = games.get(game_id).draughts
        if(game.move(req.body.from+"-"+req.body.to) != null){
            let data = parseFEN(game_id)
            if(game.game_over()){
                /**HANDLE WIN NOTIFICATION */
                if(winCheck(game_id)){
                    gameEnd(game_id,false,game.winner,game.loser)
                    res.json({
                        winner: game.winner,
                        loser: game.loser,
                        board: data
                    })
                }else{
                    /**HANDLE WHAT HAPPENS IF GAME OVER BUT NONE WON */
                }
            }else{
                res.json({
                    winner: "",
                    board: data
                })
            }
        }else{
            res.status(400).json({error: "Error while making such move, you can try again or select a different move."})
        }
    }

}

exports.gameHistory = async function(req,res){
    res.json(getHistory(req.body.game_id));
}



exports.create_game = function(req,res){
    let game_id = req.body.game_id
    let host_id = req.body.host_id
    let opponent = req.body.opponent
    var game = new Object();
    game.white = host_id
    game.black = opponent
    game.draughts = new Draughts()
    game.finished = false;
    game.last_white_pieces = new Map()
    game.last_black_pieces = new Map()
    game.fen = game.draughts.fen()
    game.winner = ""
    game.loser = ""
    game.turn = game.white
    games.set(game_id,game)
    res.status(200).json(parseFEN(game_id))
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
