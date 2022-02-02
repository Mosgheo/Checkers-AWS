const BiMap = require('bidirectional-map')
const { default: axios } = require('axios');
const socket = require("socket.io")
require("dotenv").config()
const Lobby = require('../models/lobby');


const online_users = new BiMap()  //{  client_id <-> user_id  }
const lobbies = new BiMap(); // { lobby_id -> Lobby }
const turn_timeouts = new Map(); // {lobby_id -> timoutTimer}

const invitations = new Map() // {host_id -> Set[opponent_id]}
const invitation_timeouts = new Map() // {host_id -> {opponent_id -> timeout}}

const game_service = process.env.GAME_SERVICE
const user_service = process.env.USER_SERVICE

let current_id = 0;
let free_ids = []

exports.socket = async function(server) {
    const io = socket(server, {
      cors: {
        origin: '*',
      }
    })


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
 * @param {*} player_id 
 * @returns user is online or not
 */
function isOnline(player_id){
  return online_users.has(player_id)
}
/**
 * 
 * @param {*} game_id 
 * @param {*} host_mail 
 * @param {*} opponent_mail 
 * @returns a new game istance to be sent to client
 */
async function setupGame(game_id,host_mail,opponent_mail){
  try{
    let game = []
    const {data:host_specs} = await axios.get(user_service+"/profile/getProfile",
    {params:
      {
        mail:host_mail
      }
    })
    const {data:opponent_specs} = await axios.get(user_service+"/profile/getProfile",
    {params:
      {
        mail:opponent_mail
      }
    })
    const {data: board} = await axios.post(game_service+"/game/lobbies/create_game",{game_id: game_id,host_id:host_specs.mail,opponent:opponent_specs.mail})
    game.push(host_specs)
    game.push(opponent_specs)
    game.push(board)
    game.push(game_id)
    return game
  }catch(err){
    if('response' in err && 'status' in err.response){
      if(err.response.status == 500){
        client.emit("server_error",{message:err.response.data})
      }else if(err.response.status == 404){
        client.emit("permit_error",{message:err.response.data})
      }
    }

  }

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
      }
    })
    if(user != null){
      online_users.set(client_id,user.user.email)
      return [true,user]
    }
  }catch(err){
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
      console.log("lobby not free")
      return false
    }
  }else{
    console.log("lobby not has id")
      return false
    }
}
/**
 * 
 * @param {*} mail user email 
 * @returns user username
 */
async function getUsername(mail){
  try{
    const {data:profile} = await axios.get(user_service+"/profile/getProfile", 
    {params:
      {
        mail:mail
      }
    })
    return profile.username
  }catch(err){
    console.log("ERROR WHILE RETRIEVING USERNAME")
    return null
  }
}

async function get_lobbies(user_stars){
  let data = []
  const tmp = lobbies.entries()
  for(const [lobby_id,lobby] of tmp){
    if(lobby.isFree() && lobby.getStars() >= user_stars){
      const username = await getUsername(lobby.getPlayers(0))
      if(username === null){
        console.log("something wrong with username")
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
  console.log("Changing turns for game "+lobby_id)
  await axios.put(game_service+"/game/turnChange",{game_id:lobby_id})
  let lobby = lobbies.get(lobby_id)
  let late_player = lobby.turn
  let next_player = lobby.getPlayers().filter(player => player != late_player)[0]
  lobbies.get(lobby_id).turn = next_player 
  clearTimeout(turn_timeouts.get(lobby_id))
  turn_timeouts.set(lobby_id, setTimeout(function () {
    change_turn(lobby_id)
    console.log("TURN TIMEOUT FOR GAME " + lobby_id)
  },process.env.TIMEOUT))
  io.to(lobby_id).emit("turn_change",{next_player:next_player})
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
  try{
      const {data:updated_one} = await axios.put(user_service+"/profile/updatePoints",
      {
        mail : winner,
        stars: points1,
        won: true,
        tied:tied
      })
      const{data:updated_two} = await axios.put(user_service+"/profile/updatePoints",
      {
          mail : loser,
          stars: points2,
          won:false,
          tied:tied
      })
     return [updated_one,updated_two]
    }catch(err){
      console.log(err)
      return []
    }
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
  //Player isn't in a lobby
  if(!isInLobby(player)){
    console.log(player + "just disconnected but wasn't in lobby")
    online_users.delete(client_id)
  }else{
    //player is in a lobby
    const lobby = Array.from(lobbies.values()).filter(lobby => lobby.hasPlayer(player))[0]
    let lobby_id = lobbies.getKey(lobby)
    console.log(player + "from lobby" + lobby_id + " is  trying to disconnect")
    //Lobby is free
    if(lobby.isFree()){
      console.log(online_users.get(client_id)+" just disconnected and his lobby has been deleted")
      lobbies.delete(lobby_id)
      online_users.delete(client_id)
      
    }else{
      //Lobby is full and a game is on
      try{
        let opponent = ""
        const winner = ""
        const loser = ""
        //Player disconnecting is the host
        if(lobby.getPlayers(0) == player){
           winner = lobby.getPlayers(1)
           loser = player
           opponent = winner
          const {data:game_end} = await axios.post(game_service+"/game/leaveGame",{game_id:lobby_id,winner:lobby.getPlayers(1),forfeiter:lobby.getPlayers(0)})

          io.to(lobby_id).emit("player_left",game_end)
          console.log(player +" is disconnecting and is the host of lobby "+lobby_id+", deleting game")
        }
        else{
           winner = player
           loser = lobby.getPlayers(1)

          //Player disconnecting is the guest
          console.log(player +" is in lobby "+lobby_id+" but isn't host, deleting game")
          const {data:game_end} = await axios.post(game_service+"/game/leaveGame",{game_id:lobby_id,winner:lobby.getPlayers(0),forfeiter:lobby.getPlayers(1)})
          io.to(lobby_id).emit("player_left",game_end)
          opponent = loser
        }

        const updated_users = await updatePoints(opponent,process.env.WIN_STARS,player,process.env.LOSS_STARS)
        if(updated_users){
          io.to(online_users.getKey(opponent)).emit("user_update",updated_users[0])
          client.emit("user_update",updated_users[1])
        }else{
          io.to(lobby_id).emit("server_error",{message:"Something went wrong while updating points"})
        }
        delete_lobby(lobby_id)
        online_users.delete(client_id)
        io.in(lobby_id).socketsLeave(lobby_id)
      }catch(err){
        console.log("something bad occured "+err)
        if('response' in err && 'status' in err.response){
          if(err.response.status == 500){
            io.to(lobby_id).emit("server_error",{message:err.response.data})
          }
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
  console.log("a user connected")
  //A new anon user just connected, push it to online_players
  online_users.set(client.id,get_id())
  client.on('disconnect', async()=>{
    //Remove player from active players
    const player = online_users.get(client.id)
    await handle_disconnection(player)
  });

  //Login procedure
  client.on('login', async (mail,password) => {
    console.log("a user is tryng to log in")
    //Update user id in online_users
    if(online_users.hasValue(mail)){
      client.emit("login_error",{message:"Someone is already logged in with such email"})
    }else{
      try{
        const {data:user} = await axios.post(user_service+"/login",{
          mail:mail,
          password:password
        })
        online_users.delete(client.id)
        online_users.set(client.id,mail)
        client.emit("login_ok",user)
      }catch(err){
        console.log(err)
        if('response' in err && 'status' in err.response){
          if(err.response.status == 400){
            client.emit("login_error",{message:err.response.data})
          }
        }
      }
    }
  })
  /**
   * Signup procedure
   */
  client.on('signup',async(mail,password,username,first_name,last_name)=>{
    console.log("a user is trying to sign up")
    try{
      let {data:new_user} = await axios.post(user_service+"/signup",{
          first_name: first_name,
          last_name: last_name,
          mail: mail,
          password: password,
          username: username
        })
        client.emit('signup_success',new_user)
    }catch(err){
      if('response' in err && 'status' in err.response){
        if(err.response.status == 400 || err.response.status == 500){
          client.emit('signup_error',{message:err.response.data})
        }
      }
      console.log("Signup_err",err)
    }
  })
  /**
   * Token refreshing procedure
   */
  client.on('refresh_token',async(token)=>{
    const user = await user_authenticated(token,client.id)
      if(user[0]){
        try{
          const {data:new_token} = await axios.get(user_service+"/refresh_token",
          {params:
            {
              mail: online_users.get(client.id),
              token:token
            }
          })
          client.emit("token_ok",new_token)
        }catch(err){
          console.log(err)
          if('response' in err && 'status' in err.response){
            if(err.response.status == 500){
              client.emit("token_error",{message:err.response.data})
            }
            else{
              client.emit("token_error",{message:"Your token expired, please log-in again"})
            }
          }
        }

      }else{
        client.emit("client_error",{message:"Your token expired, please log-in again"})
      }
  })

  /**
   *  * * * * * *
   * LOBBY HANDLING
   *  * * * * * * 
   **/
   client.on('build_lobby',async(lobby_name,max_stars,token)=>  {
    if(isOnline(client.id) && !isInLobby(online_users.get(client.id))){
        const user = await user_authenticated(token,client.id)
      if(user[0]){
        console.log("a user built a lobby")
        const new_lobby_id = build_lobby(lobby_name,client,max_stars)
        //FIX THIS PARAMTER IN GET LOBBIES
        const lobbies = await get_lobbies(0)
        client.emit("lobbies",{
        lobby_id:new_lobby_id,
        lobbies:lobbies
      })
      }else{
        console.log("he is damn not authenticated")
        client.emit("token_error",{message:user[1]})
      }
    }else{
      console.log("a user tried bulding a lobby while already has one")
      client.emit("permit_error",{message:"Player is either online or is already in some lobby."})
    }
  })

  /**
   * A client requested a list of lobbies
   */
  client.on('get_lobbies',async (stars,token) => {
    if(isOnline(client.id)){
      const user = await user_authenticated(token,client.id)
      if(user[0]){
        console.log("a user requested lobbies")
        const lobbies = await get_lobbies(stars)
        client.emit("lobbies",lobbies)
      }else{
        client.emit("token_error",{message:user[1]})
      }
    }else{
      client.emit("permit_error", {message:"Player is offline in some funny way."})
    }
  })

  /**
   * A client wants to join a lobby
   */
  client.on('join_lobby', async(lobby_id,token) => {
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      console.log("a user joined a lobby")
      if(isOnline(client.id) && !isInLobby(online_users.get(client.id))){
        const opponent = online_users.get(client.id)
        if(lobbies.has(lobby_id)){
          const host = lobbies.get(lobby_id).getPlayers()[0]
          if(join_lobby(lobby_id,client,opponent)){
            let game = await setupGame(lobby_id,host,opponent)
            if(game.length > 0){
              io.to(lobby_id).emit("game_started",game)
              turn_timeouts.set(lobby_id, setTimeout(async()=>{
                await change_turn(lobby_id)
                console.log("TURN TIMEOUT FOR GAME " + lobby_id)
              },process.env.TIMEOUT))
              console.log("Timeout set for game" + lobby_id)
            }else{
              console.log("Error in setting up a game")
              io.to(lobby_id).emit("server_error", {message:"Server error while creating a game, please try again"})
            }
          }else{
            console.log("error in join lobby")
            client.emit("server_error", {message:"Server error while joining lobby, please try again"})
          }
        }else{
          console.log("error in join lobby2")
          client.emit("server_error",{message:"Such lobby doesn't exist anymore"})
        }
      }else{
        console.log("error in join lobby3")
        client.emit("permit_error",{message:"Player is not online or is already in a lobby"})
      }
    }else{
      console.log("error in join lobby4")
      client.emit("token_error",{message:user[1]})
    }
  })

  /**
   * A lobby host wants to delete his lobby
   */
  client.on('delete_lobby', async(lobby_id,token) =>{
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      console.log("a user deleted a lobby")
      if(online_users.has(client.id) && lobbies.has(lobby_id)){
        const player = online_users.get(client.id)
        const lobby = lobbies.get(lobby_id)
        if(lobby.hasPlayer(player) 
        && lobby.isFree ){
          delete_lobby(lobby_id)
          console.log("è stata cancellata dia hane")
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
    && online_users.has(client.id) 
    && online_users.hasValue(opponent_mail)
    //THIS WON't WORK
    && lobby_list.filter(lobby => {
        lobby.hasPlayer(opponent_mail)
      }).length == 0
    && opponent_mail != user_mail)
    {
      const opponent_id = online_users.getKey(opponent_mail)
      io.to(opponent_id).emit("lobby_invitation",user_mail)
      if(invitations.has(user_mail)){
        invitations.get(user_mail).add(opponent_mail)
      }else{
        invitations.set(user_mail,new Set().add(opponent_mail))
      }

      //If such player already exists in invitation_timeouts map
      if(invitation_timeouts.has(user_mail)){
        invitation_timeouts.get(user_mail).set(opponent_mail,setTimeout(function(){
          //Inform both players that the invite has timed out
          io.to(opponent_id).emit("invitation_timeout",user_mail)
          client.emit("invitation_timeout",user_mail)
          //Clear the timeout associated to such invite
          clearTimeout(invitation_timeouts.get(user_mail).get(opponent_mail))
          invitation_timeouts.get(user_mail).delete(opponent_mail)
          //Clear invitation
          invitations.get(user_mail).delete(opponent_mail)
        },process.env.TIMEOUT))
      }else{
        invitation_timeouts.set(user_mail,new Map().set(opponent_mail,setTimeout(function(){
        //Inform both players that the invite has timed out
        io.to(opponent_id).emit("invitation_timeout",user_mail)
        client.emit("invitation_timeout",user_mail)
        //Clear the timeout associated to such invite
        clearTimeout(invitation_timeouts.get(user_mail).get(opponent_mail))
        invitation_timeouts.get(user_mail).delete(opponent_mail)
        //Clear invitation
        invitations.get(user_mail).delete(opponent_mail)
        },process.env.TIMEOUT)))
      }
    }else{
      client.emit("invite_error",{message:"Such user is not online at the moment, please try again later!"})
    }
  })
  
  /**
   * A client accepts someone invite to play a game.
   */
  client.on('accept_invite',async(token,opp_mail)=>{
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      const user_mail = online_users.get(client.id)
      if(invitations.has(opp_mail) == false || invitations.get(opp_mail).has(user_mail) == false){
        client.emit('invitation_expired',{message:"Your invitation for this lobby has expired"})
      }else{
        console.log("There is an invitation accepted from "+opp_mail)
        const user_mail = online_users.get(client.id)
        let opponent = io.sockets.sockets.get(online_users.getKey(opp_mail))
        let lobby_id = build_lobby(opp_mail+"-"+user_mail,opponent,Number.MAX_VALUE)
        if(join_lobby(lobby_id,client,online_users.get(client.id))){
          console.log("lobby joined good")
          try{
            let game = []
            const {data:host_specs} = await axios.get(user_service+"/profile/getProfile",
            {params:
              {
                mail: opp_mail
              }
            })
            const {data:opponent_specs} = await axios.get(user_service+"/profile/getProfile",
            {params:
              {
                mail: user_mail
              }
            })
            const {data: board} = await axios.post(game_service+"/game/lobbies/create_game",{game_id: lobby_id,host_id:host_specs.mail,opponent:opponent_specs.mail})
            game.push(host_specs)
            game.push(opponent_specs)
            game.push(board)
            game.push(lobby_id)
            io.to(online_users.getKey(opp_mail)).emit("invite_accepted")
            setTimeout(function() {
              io.to(lobby_id).emit("game_started",game)
            }, 700)
            console.log("game started")
            invitations.delete(opp_mail)
            invitation_timeouts.get(opp_mail).forEach(invite_timeout =>{
              clearTimeout(invite_timeout)
            })
            clearTimeout(invitation_timeouts.get(opp_mail+user_mail))
            invitation_timeouts.delete(opp_mail+user_mail)

            turn_timeouts.set(lobby_id, setTimeout(async ()=>{
              change_turn(lobby_id)
              console.log("TURN TIMEOUT FOR GAME " + lobby_id)
            },process.env.TIMEOUT))
          }catch(err){
            if('response' in err && 'status' in err.response){
              if(err.response.status == 500){
                client.emit("server_error",err.response.data)
              }
            }
            console.log(err)
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
      if(invitations.get(opp_mail).has(user_mail) === false){
        client.emit("invitation_expired",{message:"Your invitation for this lobby has expired"})
      }else{
        io.to(online_users.getKey(opp_mail)).emit("invitation_declined",{message:opp_mail+" has just refused your invite, we're so sry. "})
        if(invitations.has(opp_mail) && invitations.get(opp_mail).has(user_mail)){
          invitations.get(opp_mail).delete(user_mail)
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
      console.log("a user moved a piece")  
      if(online_users.has(client.id) && lobbies.has(lobby_id)){
        let player = online_users.get(client.id)
        let lobby = lobbies.get(lobby_id)
        console.log(lobby)
        //is == ok down here? ->
        if(lobby.hasPlayer(player) && lobby.turn === player){
          try{
            let {data: move_result} = await axios.put(game_service+"/game/movePiece",{game_id: lobby_id,from:from,to:to})
            //If no one won
            if(move_result.winner === "" || move_result.winner === undefined){
              //If the game tied
              if(move_result.hasOwnProperty('tie') && move_result.tie == true){
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
                console.log("Wow a game tied, you just witnessed such a rare event!")
                delete_lobby(lobby_id)
                io.sockets.adapter.rooms.get(lobby_id).clear()
              }else{
                //No one won and the game isn't tied, the show must go on
                io.to(lobby_id).emit("update_board",move_result.board)
                await change_turn(lobby_id)
              }
            }else{
              //we have a winner!
              try{
                const updated_users = await updatePoints(move_result.winner,process.env.WIN_STARS,move_result.loser,process.env.LOSS_STARS)
                if(updated_users.length !== 0){
                  io.to(lobby_id).emit("update_board",move_result.board)
                  const winner = online_users.getKey(move_result.winner)
                  const loser = online_users.getKey(move_result.loser)
                  io.to(winner).emit("game_ended",{
                    user: (move_result.winner === updated_users[0].mail ? updated_users[0] : updated_users[1]),
                    message:"Congratulations, you just have won this match, enjoy the "+process.env.WIN_STARS+" stars one of our elves just put under your christmas tree!"
                  })
                  io.to(loser).emit("game_ended",{
                    user: (move_result.loser === updated_users[0].mail ? updated_users[0] : updated_users[1]),
                    message:"I'm afraid I'll have to tell you you lost this game, "+process.env.LOSS_STARS+" stars have been removed from your profile but if you ask me that was just opponent's luck, don't give up yet"
                  })
                  console.log("Successfully sent end_game")
                  delete_lobby(lobby_id)
                  io.sockets.adapter.rooms.get(lobby_id).clear()
                }else{
                  console.log("Something wrong while updating points.")
                  client.emit("server_error",{message:"Something wrong while updating points."})
                }
              }catch(err){
                if('response' in err && 'status' in err.response){
                  if(err.response.status == 500){
                    client.emit("server_error",{message:err.response.data})
                  }
                }
                console.log(err)
              }
            }
          }catch(err){
            if('response' in err && 'status' in err.response){
              if(err.response.status == 400){
                client.emit("client_error",{message:err.response.data})
              }
            }
            console.log(err)
          }
        }else{
          client.emit("permit_error",{message:"It's not your turn or you're not in this lobby, you tell me"})
        }
      }else{
        client.emit("permit_error",{message:"Hey pal I don't know who you are nor the lobby you're referring to"})
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
    console.log("HELLO LOBBY"+lobby_id)
    let result = null
    if(user[0]){
      let player = online_users.get(client.id)

      if(lobbies.has(lobby_id) && lobbies.get(lobby_id).hasPlayer(player)){
        console.log(player+" is in a lobby")
        try{
          const lobby = lobbies.get(lobby_id)
          const winner = lobby.getPlayers().filter(p => p !== player).shift()
          console.log("DELETING GAME DIO CANE")
          console.log("lobby_id "+lobby_id)
          result = await axios.delete(game_service+"/game/leaveGame",{data:{game_id: lobby_id, player_id: player}})
          const updated_users = await updatePoints(winner,process.env.WIN_STARS,player,process.env.LOSS_STARS)
          result = result.data
          client.emit("left_game",{
            message: result[0],
            user: updated_users[0]
          })
          delete_lobby(lobby_id)

          io.to(online_users.getKey(winner)).emit("opponent_left",{
            message: result[1],
            user: updated_users[1]
          })
          console.log(io.sockets.adapter.rooms.get(lobby_id))
          io.sockets.adapter.rooms.get(lobby_id).clear()
        }catch(err){
          if('response' in err && 'status' in err.response){
            if(err.response.status == 500){
              client.emit("server_error",{message:err.response.data})
            }
          }
          console.log(err)
        }
      }else{
        console.log(player+" permit error")
        client.emit("permit_error",{message:"I don't know which lobby you're referring to and even if I knew you're not in it"})
      }
    }else{
      client.emit("token_error",{message:user[1]})
    }
  })
  /**
   * A client wants to tie a game
   
  client.on('tie_game',async(lobby_id,token) =>{
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      const player = online_users.get(client.id,token)
      if(lobbies.has(lobby_id) && lobbies.get(lobby_id).hasPlayer(player)){
        const lobby = lobbies.get(lobby_id)
        io.to(lobby_id).emit("tie_proposal",player)
        lobby.tieProposal();
        if(lobby.tie()){
          try{
            let {data:result} = await axios.put(game_service+"/game/tieGame",{game_id: lobby_id})
            io.to(lobby_id).emit("tie_game",result)
          }catch(err){
            if('response' in err && 'status' in err.response){
              if(err.response.status == 500){
                client.emit("server_error",err.response.data)
              }
            }
            console.log(err)
          }
        }
      }else{
        client.emit("permit_error",{message:"I don't know which lobby you're referring to and even if I knew you're not in it"})
      }
    }else{
      client.emit("token_error",user[1])
    }
  })
 */
  /**
   * A client requested this game moves history
   *
  client.on('game_history',async(lobby_id,token)=>{
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      if(lobbies.has(lobby_id) && lobbies.get(lobby_id).hasPlayer(online_users.get(client.id))){
        try{
          let history = await axios.get(game_service+"/game/history",{game_id : lobby_id})
          client.emit("game_history",history)
        }catch(err){
          if('response' in err && 'status' in err.response){
            if(err.response.status == 500){
              client.emit("server_error",err.response.data)
            }
          }
          console.log(err)
        }
      }else{
        client.emit("permit_error",{message:"I don't know which lobby you're referring to and even if I knew you're not in it"})
      }
    }else{
      client.emit("token_error",user)
    }
  })
*/
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
      console.log("a user sent a global-msg")
      if(online_users.has(client.id)){
        io.emit("global_msg",{sender:online_users.get(client.id), message:msg})
      }
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
      console.log("a user sent a game msg")
      console.log(online_users)
      if(online_users.has(client.id) && lobbies.has(lobby_id)
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
      let user_id = online_users.get(client.id)
      try{
        let {data:user_profile} = await axios.get(user_service+"/profile/getProfile",              
        {params:
          {
            mail:user_id
          }
        })
        if(!user_profile === null){
          client.emit("permit_error",{message:user_profile})
        }else{
          client.emit("user_profile",{message:user_profile})
        }
      }catch(err){
        if('response' in err && 'status' in err.response){
          if(err.response.status == 500 ){
            client.emit("server_error",{message:err.response.data})
          }else if(err.response.status == 404){
            client.emit("client_error",{message:err.response.data})
          }
        }
        console.log(err)
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
      try{
        console.log("Someone asked for a leaderboard")
        let {data:leaderboard} = await axios.get(user_service+"/getLeaderboard")
        if(leaderboard === null){
          client.emit("permit_error",{message:leaderboard})
        }else{
          client.emit("leaderboard",{message:leaderboard})
        }
      }catch(err){
        console.log(err)
        client.emit("server_error",{message:err.response.data})
      }
    }else{
      client.emit("token_error",{message:user[1]})
    }
  })
  /**
   * Client updated some infos on his profile
   */
  client.on('update_profile',async(params,token) =>{
    console.log("UPDATING SOME PROFILE YO")
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      const user_mail = online_users.get(client.id)
      const {data:updated_user} = await axios.put(user_service+"/profile/updateProfile",{mail:user_mail,params:params})
      if(updated_user === null){
        client.emit("permit_error",{message:user_history})
      }else{
        console.log("I updated your fucking profile")
        client.emit("updated_user",{message:updated_user})
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
      let user_id = online_users.get(client.id)
      let {data:user_history} = await axios.get(game_service+"/games/userHistory",
      {params:
        {
          mail:user_id
        }
      })
      //Getting opponents profile for every game this user has played
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
      };
      if(user_history === null){
        client.emit("permit_error",{message:user_history})
      }else{
        client.emit("user_history",{message:data})
      }
    }else{
      client.emit("token_error",{message:user[1]})
    }
  })
});


async function request_history_profile(user_mail){
  let profile = ""
  try{
    profile = await axios.get(user_service+"/profile/getProfile",              
    {params:
      {
        mail:user_mail
      }
    })
  }catch(err){
    console.log(err)
    console.log("Something went wrong while requesting avatar for user history")
  }
  if(profile != ""){
    return   {
      avatar: (profile.data.avatar == "" ? "https://picsum.photos/id/1005/400/250" : profile.data.avatar),
      username: profile.data.username
    }
  }else{
    return {
      avatar: "https://picsum.photos/id/1005/400/250",
      username: "Deleted User"}
    }
  }
}