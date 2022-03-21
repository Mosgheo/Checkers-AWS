const BiMap = require('bidirectional-map')
const { default: axios } = require('axios');
const socket = require("socket.io")
require("dotenv").config()
const Lobby = require('../models/lobby');
const https = require("https")
const path = require('path');
const fs = require('fs');

const online_users = new BiMap()  //{  client_id <-> user_id  }
const lobbies = new BiMap(); // { lobby_id -> Lobby }

const turn_timeouts = new Map(); // {lobby_id -> timoutTimer}
const invitation_timeouts = new Map() // {host_id -> {opponent_id -> timeout}}

const game_service = process.env.GAME_SERVICE
const user_service = process.env.USER_SERVICE

let current_id = 0;
let free_ids = []

const socket_agent = new https.Agent({
  cert: fs.readFileSync(path.resolve(__dirname, ".."+path.sep+"cert"+path.sep+"socket_cert.pem")),
  key: fs.readFileSync(path.resolve(__dirname, ".."+path.sep+"cert"+path.sep+"socket_key.pem")),
  rejectUnauthorized: false
})

exports.socket = async function(server) {
    const io = socket(server, {
      cors: {
        origin: '*',
      }
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
        case "get":
          response = await axios.get(url, {params: params,httpsAgent:socket_agent},{httpsAgent:socket_agent})
          break
        case "post":
          response = await axios.post(url,params,{httpsAgent:socket_agent})
          break
        case "put":
          response = await axios.put(url,params,{httpsAgent:socket_agent})
          break
        case "delete":
          response = await axios.delete(url,{data:params},{httpsAgent:socket_agent})
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

    /**
     * 
     * @returns a new id for a lobby
     */
function get_id(){
  if(free_ids.length > 0){
    return free_ids.shift()
  }else{
    let new_id = current_id
    current_id++
    return new_id.toString()
  }
}
function log(msg){
  if(process.env.DEBUG){
    console.log(msg)
  }
}

/**
 * 
 * @param {*} player_mail 
 * @returns whether a player is in a lobby or not
 */
function isInLobby(player_mail){
  for(const [_,lobby] of lobbies.entries()){
    if(lobby.hasPlayer(player_mail)){
      return true
    }
  }
  return false
}

/**
 * 
 * @param {*} game_id 
 * @param {*} host_mail 
 * @param {*} opponent_mail 
 * @returns a new game istance to be sent to client
 */
async function setupGame(game_id,host_mail,opponent_mail){
    let game = []
    const host_specs = await ask_service("get",user_service+"/profile/getProfile",{mail:host_mail})

    const opponent_specs = await ask_service("get",user_service+"/profile/getProfile",{mail:opponent_mail})

    if(host_specs.status && opponent_specs.status){
      const board = await ask_service("post",game_service+"/game/lobbies/create_game",{game_id: game_id,host_id:host_specs.response.mail,opponent:opponent_specs.response.mail})
      if(board.status){
        game.push(host_specs.response)
        game.push(opponent_specs.response)
        game.push(board.response)
        game.push(game_id)
      }
    }
    return game
}

/**
 * 
 * @param {token} token 
 * @param {*} client_id 
 * @returns true if user token is valid, false if not
 */
async function user_authenticated(token,client_id){
  try{
    const {data:user} = await axios.get(user_service+"/authenticate",{
      headers:{
        Authorization: "Bearer "+ token
      },httpsAgent:socket_agent
    },{httpsAgent:socket_agent})
    if(user != null){
      online_users.set(client_id,user.user.email)
      return [true,user]
    }
  }catch(err){
    console.log(err)
        return [false,err.response.data]
  }
}

/**
 * 
 * @param {*} room_name  lobby name
 * @param {*} client  client socket
 * @param {*} max_stars Max number of stars a client can have in order to join this lobby.
 * @returns ID of just created lobby
 */
function build_lobby(room_name,client,max_stars){
  const room_id = get_id()
  lobbies.set(room_id,new Lobby(max_stars,room_name,online_users.get(client.id)))
  client.join(room_id)
  return room_id
}
/**
 * 
 * @param {*} lobby_id
 * deletes a lobby
 */
function delete_lobby(lobby_id){
  lobbies.delete(lobby_id)
  free_ids.push(lobby_id)
  clearTimeout(turn_timeouts.get(lobby_id))
  turn_timeouts.delete(lobby_id)
  //make all sockets in this lobby leave the SocketRoom
  io.sockets.adapter.rooms.get(lobby_id).clear()
}
/**
 * 
 * @param {*} lobby_id 
 * @param {*} client client socket 
 * @param {*} player mail to join lobby
 * @returns 
 */
function join_lobby(lobby_id,client,player){
  if(lobbies.has(lobby_id)){
    const to_join = lobbies.get(lobby_id)
    if(to_join.isFree()){
        client.join(lobby_id)
        return to_join.addPlayer(player)
    }else{
      log("lobby not free")
      return false
    }
  }else{
    log("lobby not has id")
      return false
    }
}
/**
 * 
 * @param {*} mail user email 
 * @returns user username
 */
async function getUsername(mail){
    const profile = await ask_service("get",user_service+"/profile/getProfile",{mail:mail})
    if(profile.status){
      return profile.response.username
    }else{
      return ""
    }
}

async function get_lobbies(user_stars){
  let data = []
  const tmp = lobbies.entries()
  for(const [lobby_id,lobby] of tmp){
    if(lobby.isFree() && lobby.getStars() >= user_stars){
      const username = await getUsername(lobby.getPlayers(0))
      if(username == ""){
        log("something wrong with username")
      }else{
        data.push({
          lobby_id : lobby_id,
          name : lobby.getName(),
          max_stars : lobby.getStars(),
          host : username
        })
      }
    }
  }
  return data
}
/**
 * 
 * @param {*} lobby_id  ID of lobby which turn needs to be changed
 */
async function change_turn(lobby_id){
  log("Changing turns for game "+lobby_id)
  let lobby = lobbies.get(lobby_id)
  let late_player = lobby.turn
  let next_player = lobby.getPlayers().filter(player => player != late_player)[0]
  lobbies.get(lobby_id).turn = next_player 
  clearTimeout(turn_timeouts.get(lobby_id))
  await setup_game_turn_timeout(lobby_id)
  io.to(lobby_id).emit("turn_change",{next_player:next_player})
}
async function setup_game_turn_timeout(lobby_id){
  turn_timeouts.set(lobby_id, setTimeout(async()=>{
    await change_turn(lobby_id)
    await ask_service("put",game_service+"/game/turnChange",{game_id:lobby_id})
    log("Turn timeout for game " + lobby_id)
  },process.env.TURN_TIMEOUT))
  log("Timeout set for game" + lobby_id)
}
/**
 * 
 * @param {*} winner mail of the player who just won a game
 * @param {*} points1 points to update
 * @param {*} loser mail of the player who just lost a game
 * @param {*} points2 points to update
 * @returns Updated version of the two player's profile
 */
async function updatePoints(winner,points1,loser,points2,tied=false){
      const updated_one = await ask_service("put",user_service+"/profile/updatePoints",{
        mail : winner,
        stars: points1,
        won: true,
        tied:tied
      })
      const updated_two = await ask_service("put",user_service+"/profile/updatePoints",{
        mail : loser,
        stars: points2,
        won:false,
        tied:tied
      })
      if(updated_one.status && updated_two.status){
        return [updated_one.response,updated_two.response]
      }else{
        return []
      }
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
 * Handle disconnections, 3 cases:
 *  - player is not in a lobby
 *  - player is in an empty lobby
 *  - player is in a game
 * @param {*} player mail who just disconnected
 */
async function handle_disconnection(player){
  const client_id = online_users.getKey(player)
  //Player isn't in a lobby so just disconnect it
  if(!isInLobby(player)){
    log(player + "just disconnected but wasn't in lobby")
    online_users.delete(client_id)
  }else{
    //player is in a lobby, check if it's empty or he is in a game
    const lobby = Array.from(lobbies.values()).filter(lobby => lobby.hasPlayer(player))[0]
    let lobby_id = lobbies.getKey(lobby)
    log(player + "from lobby" + lobby_id + " is  trying to disconnect")
    //Lobby is free
    if(lobby.isFree()){
      log(online_users.get(client_id)+" just disconnected and his lobby has been deleted")
      lobbies.delete(lobby_id)
      online_users.delete(client_id)
    }else{
      //Lobby is full and a game is on, need to check if he's the host or not
        let winner = ""
        let loser = ""
        if(lobby.getPlayers(0) == player){
          //Player disconnecting is the host
          log(player +" is disconnecting and is the host of lobby "+lobby_id+", deleting game")
          winner = lobby.getPlayers(1)
          loser = player
        }else{
          //Player disconnecting is the guest
          log(player +" is in lobby "+lobby_id+" but isn't host, deleting game")
          winner = player
          loser = lobby.getPlayers(1)
        }
        const game_end = await ask_service("post",game_service+"/game/leaveGame",{game_id:lobby_id,winner:winner,forfeiter:loser})
        if(game_end.status){
          io.to(lobby_id).emit("player_left",game_end.response)
          const updated_users = await updatePoints(winner,process.env.WIN_STARS,loser,process.env.LOSS_STARS)
          if(updated_users){
            io.to(online_users.getKey(winner)).emit("user_update",updated_users[0])
            io.to(online_users.getKey(loser)).emit("user_update",updated_users[1])
          }else{
            io.to(lobby_id).emit("server_error",{message:"Something went wrong while updating points"})
          }
          delete_lobby(lobby_id)
          online_users.delete(client_id)
          //Clear lobby room
          io.in(lobby_id).socketsLeave(lobby_id)
        }else{
          if(game_end.response_status == 500){
            io.to(lobby_id).emit("server_error",{message:game_end.response_data})
          }else{

          }
        }
    }
  }
}

io.on('connection', async client => {
  /***
   * 
   * CONNECTION HANDLING
   * 
   */
  log("a user connected")
  //A new anon user just connected, push it to online_players
  online_users.set(client.id,get_id())
  client.on('disconnect', async()=>{
    //Remove player from active players
    const player = online_users.get(client.id)
    await handle_disconnection(player)
  });

  /**
   * Login procedure
   */ 
  client.on('login', async (mail,password) => {
    log("a user is tryng to log in")
    //Update user id in online_users
    if(online_users.hasValue(mail)){
      client.emit("login_error",{message:"Someone is already logged in with such email"})
    }else{
        const user = await ask_service("post",user_service+"/login",{
          mail:mail,
          password:password
        },"login_error","","server_error","")
        if(user.status){
          online_users.set(client.id,mail)
          client.emit("login_ok",user.response)
        }else{
          if(user.response_status == 400){
            client.emit("login_error",{message:user.response_data})
          }
        }
    }
  })
  /**
   * Signup procedure
   */
  client.on('signup',async(mail,password,username,first_name,last_name)=>{
    log("a user is trying to sign up")
      const new_user = await ask_service("post",user_service+"/signup",{
        first_name: first_name,
        last_name: last_name,
        mail: mail,
        password: password,
        username: username
      },"signup_error","","signup_error","")
        if(new_user.status){
          client.emit('signup_success',new_user.response)
        }else{
          client.emit("signup_error",{message:new_user.response_data})
        }
  })
  /**
   * Token refreshing procedure
   */
  client.on('refresh_token',async(token)=>{
    const user = await user_authenticated(token,client.id)
      if(user[0]){
          const new_token = await ask_service("get",user_service+"/refresh_token",{
            mail: online_users.get(client.id),
            token:token
          },"token_error","Your token expired, please log-in again","token_error","")
          if(new_token.status){
            client.emit("token_ok",new_token.response)
          }else{
            if(new_token.response_status == 500){
              client.emit("token_error",{message:new_token.response_data})
            }else{
              console.log(new_token.response_data)
              client.emit("token_error",{message:"Your token expired, please log-in again"})
            }
          }
      }else{
        client.emit("client_error",{message:user[1]})
      }
  })

  /**
   *  * * * * * *
   * LOBBY HANDLING
   *  * * * * * * 
   **/
   client.on('build_lobby',async(lobby_name,max_stars,token)=>  {
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      const user_mail = online_users.get(client.id)
      if(!isInLobby(user_mail)){
        log(user_mail+"is building a lobby")
        const new_lobby_id = build_lobby(lobby_name,client,max_stars)
        const lobbies = await get_lobbies(0)
        client.emit("lobbies",{
        lobby_id:new_lobby_id,
        lobbies:lobbies
      })
      }else{
        log(user_mail+" tried bulding a lobby while already has one")
        client.emit("client_error",{message:"Player is either not online or is already in some lobby."})
      }
    }else{
      log(user_mail+" is damn not authenticated")
      client.emit("token_error",{message:user[1]})
    }
  })

  /**
   * A client requested a list of lobbies
   */
  client.on('get_lobbies',async (stars,token) => {
      const user = await user_authenticated(token,client.id)
      if(user[0]){
        log(online_users.get(client.id)+" requested lobbies")
        const lobbies = await get_lobbies(stars)
        client.emit("lobbies",lobbies)
      }else{
        client.emit("token_error",{message:user[1]})
      }
  })

  /**
   * A client wants to join a lobby
   */
  client.on('join_lobby', async(lobby_id,token) => {
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      const user_mail = online_users.get(client.id)
      if(!isInLobby(user_mail)){
        log(user_mail+" joined a lobby")
        if(lobbies.has(lobby_id)){
          const host = lobbies.get(lobby_id).getPlayers()[0]
          if(join_lobby(lobby_id,client,user_mail)){
            let game = await setupGame(lobby_id,host,user_mail)
            if(game.length > 0){
              io.to(lobby_id).emit("game_started",game)
              try{
                await setup_game_turn_timeout(lobby_id)
              }catch(err){
                io.to(lobby_id).emit("server_error",{message:"Something went wrong while processing your game"})
              }
            }else{
              log("Error in setting up game "+lobby_id)
              io.to(lobby_id).emit("server_error", {message:"Server error while creating a game, please try again"})
            }
          }else{
            log("error in join lobby for lobby"+lobby_id)
            client.emit("server_error", {message:"Server error while joining lobby, please try again"})
          }
        }else{
          log("error in join lobby2 for lobby"+lobby_id)
          client.emit("server_error",{message:"Such lobby doesn't exist anymore"})
        }
      }else{
        log("error in join lobby3 for lobby"+lobby_id)
        client.emit("client_error",{message:"Player is not online or is already in a lobby"})
      }
    }else{
      log("error in join lobby4 for lobby"+lobby_id)
      client.emit("token_error",{message:user[1]})
    }
  })

  /**
   * A lobby host wants to delete his lobby
   */
  client.on('delete_lobby', async(lobby_id,token) =>{
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      const user_mail = online_users.get(client.id)
      if(lobbies.has(lobby_id)){
        const lobby = lobbies.get(lobby_id)
        //can delete a lobby only if it's free and if he's in it => he's the host
        if(lobby.hasPlayer(user_mail) 
        && lobby.isFree ){
          delete_lobby(lobby_id)
          log(user_mail+" deleted lobby "+lobby_id)
          client.emit("lobby_deleted",{message:"Your lobby has been successfully deleted"})
          client.leave(lobby_id)
        }else{
          client.emit("server_error",{message:"There has been some problem with the process of deleting a lobby."})
        }
      }
    }else{
      client.emit("token_error",{message:user[1]})
    }
  })
  /**
   * A client wants to invite a friend to play
   */
  client.on('invite_opponent',async(token,opponent_mail) =>{
    const user_mail = online_users.get(client.id)
    const user = await user_authenticated(token,client.id)
    const lobby_list = Array.from(lobbies.values())
    if(user[0]  
    && online_users.hasValue(opponent_mail)
    //THIS WON't WORK
    && lobby_list.filter(lobby => {
        lobby.hasPlayer(opponent_mail)
      }).length == 0
    && opponent_mail != user_mail)
    {
      const opponent_id = online_users.getKey(opponent_mail)
      io.to(opponent_id).emit("lobby_invitation",user_mail)

      //If such player already exists in invitation_timeouts map
      if(invitation_timeouts.has(user_mail)){
        invitation_timeouts.get(user_mail).set(opponent_mail,setTimeout(function(){
          //Inform both players that the invite has timed out
          io.to(opponent_id).emit("invitation_timeout",user_mail)
          client.emit("invitation_timeout",user_mail)
          //Clear the timeout associated to such invite
          clearTimeout(invitation_timeouts.get(user_mail).get(opponent_mail))
          invitation_timeouts.get(user_mail).delete(opponent_mail)
        },process.env.INVITE_TIMEOUT))
      }else{
        invitation_timeouts.set(user_mail,new Map())
        invitation_timeouts.get(user_mail).set(opponent_mail,setTimeout(function(){
        //Inform both players that the invite has timed out
        io.to(opponent_id).emit("invitation_timeout",user_mail)
        client.emit("invitation_timeout",user_mail)
        //Clear the timeout associated to such invite
        clearTimeout(invitation_timeouts.get(user_mail).get(opponent_mail))
        invitation_timeouts.get(user_mail).delete(opponent_mail)
        },process.env.INVITE_TIMEOUT))

      }
    }else{
      client.emit("invite_error",{message:"Can't invite player "+opponent_mail })
    }
  })
  
  /**
   * A client accepts someone invite to play a game.
   */
  client.on('accept_invite',async(token,opp_mail)=>{
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      const user_mail = online_users.get(client.id)
      if(invitation_timeouts.has(opp_mail) == false || invitation_timeouts.get(opp_mail).has(user_mail) == false){
        client.emit('invitation_expired',{message:"Your invitation for this lobby has expired"})
      }else{
        log(user_mail+" just accepted a game invite from "+opp_mail)
        let opponent = io.sockets.sockets.get(online_users.getKey(opp_mail))
        let lobby_id = build_lobby(opp_mail+"-"+user_mail,opponent,Number.MAX_VALUE)
        if(join_lobby(lobby_id,client,user_mail)){
            let game = await setupGame(lobby_id,opp_mail,user_mail)
            if(game.length != 0){
              io.to(online_users.getKey(opp_mail)).emit("invite_accepted")
              //Waiting a few ms before sending game_started
              setTimeout(function() {
                io.to(lobby_id).emit("game_started",game)
              }, 700)
              log(opp_mail +"(host) and "+user_mail+" just started a game through invitations")
              if(invitation_timeouts.has(user_mail)){
                for(const [_,invite] of invitation_timeouts.get(user_mail)){
                  clearTimeout(invite)
                }
              }
              for(const [_,invite] of invitation_timeouts.get(opp_mail)){
                clearTimeout(invite)
              }
              invitation_timeouts.delete(user_mail)
              invitation_timeouts.delete(opp_mail)
              await setup_game_turn_timeout(lobby_id)
            }else{
              client.emit("server_error",{message:"Something went wrong while setting up your game!"})
            }
        }
      }
    }else{
      client.emit("token_error",{message:user[1]})
    }
    
  })

  /**
   * A client declines an invite to play
   */
  client.on('decline_invite',async(token,opp_mail)=>{
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      const user_mail = online_users.get(client.id)
      if(!invitation_timeouts.has(opp_mail) || invitation_timeouts.get(opp_mail).has(user_mail) === false){
        client.emit("invitation_expired",{message:"Your invitation for this lobby has expired"})
      }else{
        io.to(online_users.getKey(opp_mail)).emit("invitation_declined",{message:opp_mail+" has just refused your invite, we're so sry. "})
        if(invitation_timeouts.has(opp_mail) && invitation_timeouts.get(opp_mail).has(user_mail)){
          clearTimeout(invitation_timeouts.get(opp_mail).get(user_mail))
          invitation_timeouts.get(opp_mail).delete(user_mail)
        }else{
          client.emit("invitation_expired",{message:"Your invitation for this lobby has expired"})
        }
      }
    }else{
      client.emit("token_error",{message:user[1]})
    }
  })

  /**
   *  * * * * * *
   * GAME HANDLING
   *  * * * * * * 
   **/


  /**
   *  Inside of a game, a client moves a piece into the board
   */
  client.on('move_piece',async (lobby_id,from,to,token) =>{
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      let player = online_users.get(client.id)
      if(lobbies.has(lobby_id)){
        let lobby = lobbies.get(lobby_id)
        if(lobby.hasPlayer(player) && lobby.turn == player){
            let move_result = await ask_service("put",game_service+"/game/movePiece",{game_id: lobby_id,from:from,to:to})
            //If no one won
            if(move_result.status){
              move_result = move_result.response
              if(move_result.winner === undefined || move_result.winner === "" ){
                //If the game tied
                if('tie' in move_result && move_result.tie == true){
                  const updated_users = await updatePoints(move_result.winner,process.env.TIE_STARS,move_result.loser,process.env.TIE_STARS,true)
                  io.to(lobby_id).emit("update_board",move_result.board)
                  io.to(online_users.getKey(updated_users[0].mail)).emit("game_ended",{
                    user:online_users[0],
                    message: "The game ended in a tie, both players received "+process.env.TIE_STARS +"stars"
                  })
                  io.to(online_users.getKey(updated_users[1].mail)).emit("game_ended",{
                    user:online_users[1],
                    message: "The game ended in a tie, both players received "+process.env.TIE_STARS +"stars"
                  })
                  log("Wow game "+lobby_id+" tied, you just witnessed such a rare event!")
                  delete_lobby(lobby_id)
                }else{
                  //No one won and the game isn't tied, the show must go on
                  io.to(lobby_id).emit("update_board",move_result.board)
                  try{
                    await change_turn(lobby_id)
                  }catch(err){
                    log("error in game "+lobby_id+"\n"+err)
                    io.to(lobby_id).emit("server_error",{message:"Something went wrong while processing your game"})
                  }
                }
              }else{
                //we have a winner!
                  const updated_users = await updatePoints(move_result.winner,process.env.WIN_STARS,move_result.loser,process.env.LOSS_STARS)
                  if(updated_users.length !== 0){
                    io.to(lobby_id).emit("update_board",move_result.board)
                    const winner = online_users.getKey(move_result.winner)
                    const loser = online_users.getKey(move_result.loser)
                    //Inform winner
                    io.to(winner).emit("game_ended",{
                      user: (move_result.winner === updated_users[0].mail ? updated_users[0] : updated_users[1]),
                      message:"Congratulations, you just have won this match, enjoy the "+process.env.WIN_STARS+" stars one of our elves just put under your christmas tree!"
                    })
                    //Inform loser
                    io.to(loser).emit("game_ended",{
                      user: (move_result.loser === updated_users[0].mail ? updated_users[0] : updated_users[1]),
                      message:"I'm afraid I'll have to tell you you lost this game, "+process.env.LOSS_STARS+" stars have been removed from your profile but if you ask me that was just opponent's luck, don't give up yet"
                    })
                    log("Successfully sent end_game for  game "+lobby_id)
                    delete_lobby(lobby_id)
                  }else{
                    log("Something wrong while updating points for "+winner+" or "+loser)
                    client.emit("server_error",{message:"Something wrong while updating points."})
                  }
              }
            }else{
              if(move_result.response_status == 400){
                client.emit("client_error",move_result.response_data)
              }else{
                client.emit("server_error",{message:"Something went wrong while making your move, please try again"})
              }
              
            }
        }else{
          client.emit("client_error",{message:"It's not your turn or you're not in this lobby, you tell me"})
        }
      }else{
        client.emit("client_error",{message:"Hey pal I don't know who you are nor the lobby you're referring to"})
      }
    }else{
      client.emit("token_error",{message:user[1]})
    }
  })
  /**
   * A client leaves an already started game.
   */
  client.on('leave_game',async(lobby_id,token) => {
    const user = await user_authenticated(token,client.id)
    let result = null
    if(user[0]){
      let player = online_users.get(client.id)
      if(lobbies.has(lobby_id) && lobbies.get(lobby_id).hasPlayer(player)){
        log(player+"is trying to delete lobby"+lobby_id+"in which I just confirmed is in")
          const lobby = lobbies.get(lobby_id)
          const winner = lobby.getPlayers().filter(p => p !== player).shift()
          result = await ask_service("delete",game_service+"/game/leaveGame",{data:{game_id: lobby_id, player_id: player}})
          if(result.status){
            result = result.response.data
            const updated_users = await updatePoints(winner,process.env.WIN_STARS,player,process.env.LOSS_STARS)
            if(updated_users.length > 0 ){
              client.emit("left_game",{
                message: result[0],
                user: updated_users[0]
              })
              delete_lobby(lobby_id)
              io.to(online_users.getKey(winner)).emit("opponent_left",{
                message: result[1],
                user: updated_users[1]
              })
              log(player+" just left game "+lobby_id+", I just assigned the win to "+winner)
            }
          }else{
            if(result.response_status == 400){
              client.emit("client_error",result.response_data)
            }else{
              client.emit("server_error",{message:"Something went wrong while leaving game, please try again"})
            }
          }
      }else{
        log(player+" permit error")
        client.emit("client_error",{message:"I don't know which lobby you're referring to and even if I knew you're not in it"})
      }
    }else{
      client.emit("token_error",{message:user[1]})
    }
  })

  /**
   *  * * * * * *
   * CHAT HANDLING
   *  * * * * * * 
   **/

  /**
   * A client is sending a global msg
   */
  client.on('global_msg',async(msg,token)=>{
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      const user_mail = online_users.get(client.id)
      log(user_mail+" just sent a global-msg")
      io.emit("global_msg",{sender:user_mail, message:msg})
    }else{
      client.emit("token_error",{message:user[1]})
    }
  })

  /**
   * A client is sending a msg in his game chat
   */
  client.on('game_msg',async(lobby_id,msg,token)=>{
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      const user_mail = online_users.get(client.id)
      log(user_mail+" just sent a game-msg for game"+lobby_id)
      if(lobbies.has(lobby_id)
      && lobbies.get(lobby_id).getPlayers().includes(online_users.get(client.id))){
        io.to(lobby_id).emit("game_msg",{sender:online_users.get(client.id), message:msg})
      }
    }else{
      client.emit("token_error",{message:user[1]})
    }
  })

  /**
   *  * * * * * *
   * USER HANDLING
   *  * * * * * * 
   **/

  /**
   * Client requested his profile
   */
  client.on('get_profile',async(token) =>{
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      let user_mail = online_users.get(client.id)
        const user_profile = await ask_service("get",user_service+"/profile/getProfile", {
          mail:user_mail
        })
        if(user_profile.status){
          client.emit("user_profile",user_profile.response)
        }else{
          client.emit("client_error",{message:user_profile.response_data})
          log("Error while getting profile for "+user_mail+"\n"+err)
        }
    }else{
      client.emit("token_error",{message:user[1]})
    }
  })
  /**
   * Client requested leaderboard
   */
  client.on('get_leaderboard',async(token) =>{
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      const user_mail = online_users.get(client.id)
        log(user_mail+" just asked for a leaderboard")

        const leaderboard = await ask_service("get",user_service+"/getLeaderboard","")
        if(leaderboard.status){
          client.emit("leaderboard",leaderboard.response)
        }else{
          client.emit("client_error",{message:leaderboard.response_data})
        }
    }else{
      client.emit("token_error",{message:user[1]})
    }
  })
  /**
   * Client updated some infos on his profile
   */
  client.on('update_profile',async(params,token) =>{
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      const user_mail = online_users.get(client.id)
        const updated_user = await ask_service("put",user_service+"/profile/updateProfile",{mail:user_mail,params:params})
        if(updated_user.status){
          log(user_mail+"'s profile has just been successfully updated")
          client.emit("updated_user",updated_user.response)
        }else{
          client.emit("client_error",{message:updated_user.response_data})
        }
    }else{
      client.emit("token_error",{message:user[1]})
    }
  })

  /**
   * Client requested his games history
   */
  client.on('get_history', async(token) => {
    const user = await user_authenticated(token,client.id)
    const users_avatar = new Map()
    const data = []

    if(user[0]){
      let user_mail = online_users.get(client.id)
      let user_history = await ask_service("get",game_service+"/games/userHistory",
        {
          mail:user_mail
        }
      )
      if(user_history.status){
        user_history = user_history.response
        for( const game  of user_history) {
          //If  !already requested this user profile
          if(!users_avatar.has(game.winner)){
            users_avatar.set(game.winner,await request_history_profile(game.winner))
          }
          //If  !already requested this user profile
          if(!users_avatar.has(game.loser)){
            users_avatar.set(game.loser,await request_history_profile(game.loser))
          }
          data.push({
            winner: {
              mail: game.winner,
              username:  users_avatar.get(game.winner).username,
              avatar: users_avatar.get(game.winner).avatar
            },
            loser:{
              mail: game.loser,
              username: users_avatar.get(game.loser).username,
              avatar: users_avatar.get(game.loser).avatar
            },
            fen:game.fen,
            history:game.history
          })
        }
        log("Just sent user_history for "+user_mail)
        client.emit("user_history",data)
      }else{
        client.emit("client_error",{message:user_history})
      }
      //Getting opponents profile for every game this user has played
    }else{
      client.emit("token_error",{message:user[1]})
    }
  })
});


async function request_history_profile(user_mail){
  let profile = ""
    profile = await ask_service("get",user_service+"/profile/getProfile",              
      {
        mail:user_mail
      }
    )

  if(profile.status){
    profile = profile.response
    return   {
      avatar: (profile.avatar == "" ? "https://picsum.photos/id/1005/400/250" : profile.avatar),
      username: profile.username
    }
  }else{
    return {
      avatar: "https://picsum.photos/id/1005/400/250",
      username: "Deleted User"}
    }
  }
}