
const Game = require('../models/gameModel')
const Draughts = require('./draughts')

let games = new Map(); // game_id -> game
     /*      game: {
                white: "",
                black: "",
                draughts: null,
                finished: false,
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
    let game = gameInstance.draughts
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
    try{
        if(!tie){
            const match = new Game({
                fen: game.draughts.fen(),
                history:getHistory(game_id),
                winner: winner,
                loser: loser 
            })
            await match.save()
            games.delete(game_id)
        }else{
            const match = new Game({
                fen: game.draughts.fen(),
                history:getHistory(game_id),
                winner: "Game has been settled with a tie.",
                loser: game.loser
            })
            await match.save()
            games.delete(game_id)
        }
        return true
    }catch(err){
        console.log(err)
        return false
    }

}
function getHistory(game_id){
    games.get(game_id).draughts.getHistory({verbose:true});
}
exports.tieGame = function(req,res){
    //WILL "_" BELOW WORK?
    gameEnd(req.body.game_id,true,_,_).then(
        res.status(200).send({message: "Game has been settled with a tie, each player will not earn nor lose stars"})
    ).catch(
        res.status(500).send({message: "Something went wrong while closing the game."})
    )


}
exports.user_history = async function(req,res){
    console.log("hello i'm here")
    const mail = req.query.mail
    try{
        res.status(200).json(await Game.find({$or:[{'winner':mail},{'loser':mail}]}))
    }catch(err){
        res.json(500).send({message:"Something wrong while getting user games history"})
    }

}
exports.leaveGame = async function(req,res){
    let game_id = req.body.game_id
    let quitter = req.body.player_id
    try{
        if(games.has(game_id)){
            let game = games.get(game_id)
            if(game.white === quitter){
                await gameEnd(game_id,false,gameInstance.black,gameInstance.white)
            }else{
                await gameEnd(game_id,false,gameInstance.white,gameInstance.black)
            }
        }
        let data = []
        data.push( "You successfully left the game!\n "+process.env.LOSS_STARS+" stars have been removed from your profile!");
        data.push( "The opponent has left the game!\n "+process.env.WIN_STARS+" stars have been added to your profile")
        res.status(200).send(data)
    }catch(err){
        res.status(500).send({message:"Internal server error while leaving game"})
    }

}

exports.deleteGame = async function(req,res){
    const game_id = req.body.game_id
    const forfeiter = req.body.forfeiter
    const winner = req.body.winner
    const game_ended = await gameEnd(game_id,false,winner,forfeiter)
    if(game_ended){
        res.status(200).send({message: forfeiter +"has disconnected from the game,"+winner+" has officially won the game"})
    }else{
        res.status(500).send({message: "Something went wrong while closing the game."})
    }
}

exports.movePiece = function(req,res){
    let game_id = req.body.game_id
    if(!games.has(game_id)){
        res.status(400).send({message: "Can't find such game"})
    }else{
        let game = games.get(game_id).draughts
        console.log(parseFEN(game_id))
        if(game.move({from: req.body.from, to: req.body.to }) != false){
            let data = parseFEN(game_id)
            console.log(data)
            console.log(req.body.from+"-"+req.body.to)
            if(game.gameOver()){
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
            res.status(400).send({message: "Error while making such move, you can try again or select a different move."})
        }
    }

}

exports.gameHistory = async function(req,res){
    try{
        res.status(200).json(getHistory(req.body.game_id));
    }catch(err){
        res.status(500).send({message:"Something went wrong while retrieving game history."})
    }

}

exports.create_game = function(req,res){
    try{
        let game_id = req.body.game_id
        let host_id = req.body.host_id
        let opponent = req.body.opponent
        let game = new Object();
        game.white = host_id
        game.black = opponent
        game.draughts = new Draughts()
        game.finished = false;
        game.fen = game.draughts.fen()
        game.winner = ""
        game.loser = ""
        game.turn = game.white
        games.set(game_id,game)
        res.status(200).json({
            board: parseFEN(game_id)
        })
    }catch(err){
        console.log(err)
        res.status(500).send({message:"Something went wrong while creating a game"})
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
    let match = games.get(game_id)
    let game = match.draughts


    let fen = game.fen()
    let fields = fen.split(':')
    data.push(fields[0])

    let white_pieces = fields[1].split(',')
    let black_pieces = fields[2].split(',')
    white_pieces[0] = white_pieces[0].substring(1)
    black_pieces[0] = black_pieces[0].substring(1)
    let white_pieces_with_moves = new Map()
    let black_pieces_with_moves = new Map()

    for (let i = 0; i < black_pieces.length; i++) {
        let piece = black_pieces[i]
        if(black_pieces.length == 1){
            console.log("IT'S FINALLY THE LAST INDEX: " +black_pieces[0])
        }
        let moves = game.getLegalMoves(piece)

        black_pieces_with_moves.set(piece,moves)
    
    }
    for (let i = 0; i < white_pieces.length; i++) {
        let piece = white_pieces[i]
        if(white_pieces.length == 1){
            console.log("IT'S FINALLY THE LAST INDEX: " +piece)
        }
        let moves = game.getLegalMoves(piece)
        white_pieces_with_moves.set(piece,moves)
    }
    data.push(Object.fromEntries(white_pieces_with_moves))
    data.push(Object.fromEntries(black_pieces_with_moves))
    return data
}
