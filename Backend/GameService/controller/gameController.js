
const Game = require('../models/gameModel')
const Draughts = require('./draughts')

let games = new Map(); // {game_id -> game}
     /*      game: {
                white: "",
                black: "",
                draughts: null,
                finished: false,
                winner: "",
            }
     */

/**
 ** ** ** ** ** ** **
 ** GAME HANDLING  **
 ** ** ** ** ** ** **
 */


 /**
  * 
  * @param {*} game_id To retrieve the game instance
  * @returns wheter such game is over because someone won.
  */
function winCheck(game_id){
    let gameInstance = games.get(game_id)
    let game = gameInstance.draughts
    if(game.fen().split(':')[1].length <= 1){
        game.winner = gameInstance.black
        game.loser = gameInstance.white
        return true
    }
    else if(game.fen().split(':')[2].length <= 1 ){
        game.winner = gameInstance.white
        game.loser = gameInstance.black
        return true
    }
    return false
}
/** to be called when something goes wrong and someone crashes,
 * need to stop the game and save its state
 *
async function saveGame(game_id) {
    let game = games.get(game_id).draughts
    history = game.history();
    fen = game.fen()
    Game.findOneAndUpdate({"game_id":game_id},{
        $set: {
            history:game_history,
            fen:fen}})
    
}*/
/**
 * Handles a game end.
 * @param {*} game_id  game that just ended
 * @param {*} tie whether it resulted in a tie.
 * @param {*} winner player who won (same as loser if "tie" param is set to TRUE)
 * @param {*} loser player who lost (same as winner if "tie" param is set to TRUE)
 * @returns true if game was terminated correctly and successfully saved into DB, false otherwise.
 */
async function gameEnd(game_id,tie,winner,loser){
    console.log("HELLO I?M GAME END")
    console.log(winner)
    console.log("HE LOST "+loser)
    let game = games.get(game_id)
    try{
        if(!tie){
            console.log("game didn't tie")
            const match = new Game({
                fen: game.draughts.fen(),
                winner: winner,
                loser: loser 
            })
            await match.save()
            games.delete(game_id)
        }else{
            const match = new Game({
                fen: game.draughts.fen(),
                winner: "Game has been settled with a tie.",
                loser: "Game has been settled with a tie."
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

exports.tieGame = function(req,res){
    gameEnd(req.body.game_id,true,_,_).then(
        res.status(200).send({message: "Game has been settled with a tie, each player will not earn nor lose stars"})
    ).catch(
        res.status(500).send({message: "Something went wrong while closing the game."})
    )


}
/**
 * Returns all games played by a user.
 */
exports.user_history = async function(req,res){

    const mail = req.query.mail
    console.log("History mail "+mail)
    try{
        res.status(200).json(await Game.find({$or:[{'winner':mail},{'loser':mail}]}))
    }catch(err){
        res.json(500).send({message:"Something wrong while getting user games history"})
    }

}
/**
 * Handles user leaving a game
 */
exports.leaveGame = async function(req,res){
    console.log("IVE FINALLY BEEN REQUESTED FFS")
    let game_id = req.body.game_id
    let quitter = req.body.player_id
    console.log("hello game "+game_id)
    console.log("quitter"+quitter)
    try{
        if(games.has(game_id)){
            console.log("yee we got a game")
            let game = games.get(game_id)
            if(game.white === quitter){
                console.log("Host is leaving")
                await gameEnd(game_id,false,game.black,game.white)
            }else{
                if(game.black === quitter){
                    console.log("Opponent is leaving")
                    await gameEnd(game_id,false,game.white,game.black)
                }else{
                    res.status(400).send({message:quitter+" is not in any game"})
                    return
                }
            }
            let data = []
            data.push( "You successfully left the game!\n "+process.env.LOSS_STARS+" stars have been removed from your profile!");
            data.push( "The opponent has left the game!\n "+process.env.WIN_STARS+" stars have been added to your profile")
            res.status(200).send(data)
        }else{
            console.log("wtf is wrong w/this")
            res.status(400).send({message:"There is no such game"})
        }

    }catch(err){
        console.log("SOEMTHING WERNT WROOOONG")
        console.log(err)
        res.status(500).send({message:"Internal server error while leaving game"})
    }

}
exports.turnChange = function(req,res){
    const game_id = req.body.game_id
    console.log(game_id)
    if(games.has(game_id)){
        games.get(game_id).draughts.change_turn()
        res.status(200).json()
    }else{
        res.status(400).json({message:"No such game"})
    }
}
/**
 * 
 *
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
}*/

/**
 * A user moves a piece inside the board
 */
exports.movePiece = function(req,res){
    let game_id = req.body.game_id
    if(!games.has(game_id)){
        res.status(400).send({message: "Can't find such game"})
    }else{
        let game = games.get(game_id).draughts
        if(game.move({from: req.body.from, to: req.body.to }) != false){
            let data = parseFEN(game_id)
            console.log(req.body.from+"-"+req.body.to)
            if(game.gameOver()){
                console.log("It's game over you dumbasses")
                /**HANDLE WIN NOTIFICATION */
                if(winCheck(game_id)){
                    gameEnd(game_id,false,game.winner,game.loser)
                    res.json({
                        winner: game.winner,
                        loser: game.loser,
                        board: data
                    })
                }else{
                    gameEnd(game_id,true,game.winner,game.loser)
                    res.json({
                        winner:"",
                        tie:true,
                        board:data
                    })
                }
            }else{
                console.log("The show must go on fellas")
                res.json({
                    winner: "",
                    board: data
                })
            }
        }else{
            console.log("something so wrong happened to your code")
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
        if(piece !== "" && piece !== null){
            if(piece.charAt(0) === "K"){
                console.log("found a king")
                let moves = game.getLegalMoves(piece.substring(1))
                black_pieces_with_moves.set(piece,moves)
            }else{
                let moves = game.getLegalMoves(piece)
                black_pieces_with_moves.set(piece,moves)
            }

        }
    }
    for (let i = 0; i < white_pieces.length; i++) {
        let piece = white_pieces[i]
        if(piece !== "" && piece !== null){
            if(piece.charAt(0) === "K"){
                let moves = game.getLegalMoves(piece.substring(1))
                white_pieces_with_moves.set(piece,moves)
            }else{
                let moves = game.getLegalMoves(piece)
                white_pieces_with_moves.set(piece,moves)
            }
        }

    }
    data.push(Object.fromEntries(white_pieces_with_moves))
    data.push(Object.fromEntries(black_pieces_with_moves))
    return data
}
