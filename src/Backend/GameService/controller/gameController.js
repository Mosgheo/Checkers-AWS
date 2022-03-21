
const Game = require('../models/gameModel')
const Draughts = require('./draughts')
const https = require("https")
const path = require('path');
const fs = require('fs');
const { default: axios } = require('axios');
let games = new Map(); // {game_id -> game}
     /*      game: {
                white: "",
                black: "",
                draughts: null,
                finished: false,
                winner: "",
            }
     */
function log(msg){
    if(process.env.DEBUG){
        console.log(msg)
    }
}
const game_agent = new https.Agent({
    cert: fs.readFileSync(path.resolve(__dirname, ".."+path.sep+"cert"+path.sep+"game_cert.pem")),
    key: fs.readFileSync(path.resolve(__dirname, ".."+path.sep+"cert"+path.sep+"game_key.pem")),
    rejectUnauthorized: false
  })
    register_and_initialize_backup()
    /**
     * @TODO FILL THIS METHOD
     *  SET INITIAL SERVICE STATE BASED ON SOME BACKUP SENT BY HBController
     *  */ 
    function restore_backup(backup){
      // TODO
    }
    /**
     * @TODO FILL THIS METHOD
     * BUILD A BACKUP OF THIS SERVICE TO BE SENT TO HBController
     */
    function build_backup(){
      return ""
    }
/**
 * 
 * @param err  error to be examined
 * @returns true if err is some form of HTTP error, false otherwise
 */
function request_error(err){
    return 'response' in err &&
            err.response != undefined &&
             'status' in err.response
             && err.response.status != undefined
  }
   /**
     * Function used to make request to other services
     * 
     * @param {*} method HTTP method to use
     * @param {*} url service's url
     * @param {*} params request's params 
     * @returns  { status:
    *             response_status:
    *             response_data:
    *          }
    */
 async function ask_service(method,url,params){
   let response = ""
   const default_error_msg = {
     status:false,
     response_status:"405",
     response_data:"Wrong HTTPS method call"
   }
   try{
     switch(method){
       case "post":
         response = await axios.post(url,params,{httpsAgent:game_agent})
         break
       case "put":
         response = await axios.put(url,params,{httpsAgent:game_agent})
         break
       default:
         return default_error_msg
     }
     return {
       status:true,
       response:response.data
     }
   }catch(err){
     console.log(err)
     return request_error(err) ? {status:false, response_status:err.response.status, response_data : err.response.data} : default_error_msg
   }
 }
    async function set_heartbeat_timer(){
      setTimeout(async ()=>{
        log("Sending heartbeat..")
        const hb_response = await ask_service("put",process.env.HB_SERVICE+"/heartbeat",{service_name: process.env.NAME,backup:build_backup()})
        if(hb_response.status){
          console.log("Heartbeat_response: "+ JSON.stringify(hb_response))
          set_heartbeat_timer()
        }else{
          log("failed to send heartbeat")
        }
      },process.env.HB_TIMEOUT)
    }

    async function register_and_initialize_backup(){
      const response = await ask_service("post",process.env.HB_SERVICE+"/register",{service_name:process.env.NAME})
      console.log(JSON.stringify(response))
      if(response.status){
        if(response.response.backup != ""){
          restore_backup()
        }
        set_heartbeat_timer()
      }else{
        setTimeout(async()=>{
          register_and_initialize_backup()
        },process.env.REGISTER_RETRY_TIMEOUT)
      }
    }

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
/**
 * Handles a game end.
 * @param {*} game_id  game that just ended
 * @param {*} tie whether it resulted in a tie.
 * @param {*} winner player who won (same as loser if "tie" param is set to TRUE)
 * @param {*} loser player who lost (same as winner if "tie" param is set to TRUE)
 * @returns true if game was terminated correctly and successfully saved into DB, false otherwise.
 */
async function gameEnd(game_id,tie,winner,loser){
    log("game "+game_id+" just ended, "+winner+" won and "+loser+" lost")
    let game = games.get(game_id)
    try{
        if(!tie){
            log("game "+game_id+ "didn't end in tie")
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
        log("Something went wrong while closing game "+game_id)
        log(err)
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
    log("Sending game history for "+mail)
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
    let game_id = req.body.game_id
    let quitter = req.body.player_id
    try{
        if(games.has(game_id)){
            log(quitter +" is leaving game "+game_id)
            let game = games.get(game_id)
            if(game.white === quitter){
                log(quitter+ " is the host of game "+game_id)
                await gameEnd(game_id,false,game.black,game.white)
            }else{
                if(game.black === quitter){
                    log(quitter+ " is not the host of game "+game_id)
                    await gameEnd(game_id,false,game.white,game.black)
                }else{
                    log("Wat apparently "+quiter+"has nothing to do with this game")
                    res.status(400).send({message:quitter+" is not in any game"})
                    return
                }
            }
            let data = []
            data.push( "You successfully left the game!\n "+process.env.LOSS_STARS+" stars have been removed from your profile!");
            data.push( "The opponent has left the game!\n "+process.env.WIN_STARS+" stars have been added to your profile")
            res.status(200).send(data)
        }else{
            log("There is no such thing as game "+game_id)
            res.status(400).send({message:"There is no such game"})
        }

    }catch(err){
        log("Something wrong while processing "+quitter+" request of leaving game "+game_id)
        log(err)
        res.status(500).send({message:"Internal server error while leaving game"})
    }

}
exports.turnChange = function(req,res){
    const game_id = req.body.game_id
    if(games.has(game_id)){
        log("Changing turn for game "+game_id)
        games.get(game_id).draughts.change_turn()
        res.status(200).json()
    }else{
        log("Someone tried to change turn for game "+game_id+" but such game doesn't exist")
        res.status(400).json({message:"No such game"})
    }
}

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
            log(req.body.from+"-"+req.body.to)
            if(game.gameOver()){
                log("Game "+game_id+" is over!")
                if(winCheck(game_id)){
                    log("Someone won game "+game_id)
                    gameEnd(game_id,false,game.winner,game.loser)
                    res.json({
                        winner: game.winner,
                        loser: game.loser,
                        board: data
                    })
                }else{
                    log("Game "+game_id+" just resulted in a tie, how lucky are you to witness this event?")
                    gameEnd(game_id,true,game.winner,game.loser)
                    res.json({
                        winner:"",
                        tie:true,
                        board:data
                    })
                }
            }else{
                log("Moving a piece from game "+game_id )
                res.json({
                    winner: "",
                    board: data
                })
            }
        }else{
            log("Something wrong while trying to move a piece for game "+game_id)
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
        log("Just created game "+game_id)
        res.status(200).json({
            board: parseFEN(game_id)
        })
    }catch(err){
        log(err)
        res.status(500).send({message:"Something went wrong while creating a game"})
    }
}


/**
 ** UTILITIES
 */

/*Attaches to every Piece on the board its list of available moves for frontend purposes.
* String is to be sent to client on the form of:
* let data = [TURN, Map(WHITE_PIECE->MOVES),Map(BLACK_PIECE->MOVES)]
* es: [B,WHITE(3->(5,10,3)10K->(5,2,5,4)),BLACK(4->(5,10)10K->(5,2))]
* OBV a draught that's not a king can only have max 2 moves.
* K after a number means that piece is a KING
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
