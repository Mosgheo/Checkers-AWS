const BiMap = require('bidirectional-map')
const { default: axios } = require('axios');
const socket = require("socket.io")
require("dotenv").config()

const Lobby = require('../models/lobby');
const { listeners } = require('../../UserService/models/userModel');




//TURN HANDLING 
const online_users = new BiMap()  //{  client_id <-> user_id  }
const lobbies = new Map(); // { lobby_id -> Lobby }
const turn_timeouts = new Map(); // {lobby_id -> timoutTimer}

const invitations = new Map() // {host_id -> opponent_id}
const invitation_timeouts = new Map() // {inv_id -> timeout}

const game_service = process.env.HOSTNAME+":"+process.env.GAME_SERVICE_PORT
const user_service = process.env.HOSTNAME+":"+process.env.USER_SERVICE_PORT
let current_id = 0;
let free_ids = []

exports.socket = async function(server) {
    const io = socket(server, {
      cors: {
        origin: '*',
      }
    })

/**
 * Missing:
 * */
 
function get_id(){
  if(free_ids.length > 0){
    return free_ids.shift()
  }else{
    let new_id = current_id
    current_id++
    return new_id
  }
}
//WILL IT WORK ???
async function user_authenticated(token){
  try{
    const user = await axios.get(user_service+"/authenticate",{
      headers:{
        Authorization: "Bearer "+token
      }
    })
    if(user != null){
      return [true,user]
    }
  }catch(err){
    if(err.response.status == 400){
      return [false,err.response.data]
    }

  }
}

function build_lobby(room_name,client,max_stars){
  const room_id = get_id()
  lobbies.set(room_id,new Lobby(max_stars,room_name,online_users.get(client.id)))
  client.join(room_id)
  return room_id
}

function delete_lobby(game_id){
  lobbies.delete(game_id)
  free_ids.push(game_id)
}

function join_lobby(lobby_id,client,player){
  if(lobbies.has(lobby_id)){
    const to_join = lobbies.get(lobby_id)
    if(to_join.isFree()){
        return to_join.addPlayer(player)
        && client.join(lobby_id)
    }else{
      return false
    }
  }else{
      return false
    }
}

function get_lobbies(user_stars){
  return Array.from(lobbies.values())
  .filter(lobby => lobby.isFree() && lobby.max_stars >= user_stars)
  .map(lobby =>{
    var tmpLobby = new Object();
    tmpLobby.id = lobby_id
    tmpLobby.name = lobby.name
    tmpLobby.max_stars = lobby.max_stars
    tmpLobby.host = lobby.getPlayers(0)
    return tmpLobby
  })
  /*lobbies.forEach((lobby_id,lobby)=>{
    //SHould I just return the whole lobby item?
    if(lobby.isFree && lobby.max_stars >= user_stars){
      var tmpLobby = new Object();
      tmpLobby.id = lobby_id
      tmpLobby.name = lobby.name
      tmpLobby.max_stars = lobby.max_stars
      tmpLobby.host = lobby.getPlayers(0)
      return tmpLobby
      available_lobbies.push(tmpLobby)
    }
  })*/
}
function invitation_timeout(inv_id){
  invitations.delete(inv_id)
  io.to(inv_id).emit("invitation_timeout")
}

function turn_timeout(lobby_id){
  clearTimeout(turn_timeouts.get(game.id));
  change_turn(lobby_id)
}

function change_turn(lobby_id){
  let lobby = lobbies.get(lobby_id)
  let lobbyPlayers = lobby.getPlayers()
  let late_player = lobby.turn
  let next_player = lobbyPlayers.splice(lobbyPlayers.indexOf(late_player),1)
  lobbies.get(lobby_id).turn = next_player 
  turn_timeouts.set(lobby_id, setTimeout(turn_timeout(lobby_id),process.env.TIMEOUT))
  io.to(lobby_id).emit("turn_change",{next_player:next_player})
}

async function updatePoints(player1,points1,player2,points2){
  try{
    let updatedUser = await axios.put(user_service+"/profile/updatePoints",
    {
      user_id : player1,
      stars: points1
    })
    if(updatedUser){
      updatedUser = await axios.put(user_service+"/profile/updatePoints",
      {
        user_id : player2,
        stars: points2
      })
    }
    return updatedUser
    }catch(err){
      if(err.response.status == 500){
        io.to(lobby_id).emit("server_error",error.response.data)
      }
    }
}


io.on('connection', async client => {
  console.log("a user connected")
  //A new anon user just connected, push it to online_players
  online_users.set(client.id,get_id())

  client.on('disconnect', function(){
    console.log('A player disconnected');
    //Remove player from active players
    online_users.deleteValue(client)
    });

  client.on('login', async (mail,password) => {
    console.log("a user is tryng to log in")
    //Update user id in online_users
    //TODO maybe should receive mail and
    //search in DB for the corresponding username
    try{
      const user = await axios.post(user_service+"/login",{
        mail:mail,
        password:password
      })
      online_users.set(client.id,mail)
      client.emit("login_ok",user.data)
    }catch(err){
      if(err.response.status == 400){
        client.emit("login_error",err.response.data)
      }
    }
  

  })
  client.on('signup',async(email,password,username)=>{
    console.log("a user is trying to sign up")
    try{
      let {data:new_user} = await axios.post(user_service+"/signup",{
          email:email,
          password:password,
          username:username
        })
        client.emit('signup_success',new_user)
    }catch(err){
      if(err.response.status == 400 || err.response.status == 500){
        client.emit('signup_error',err.response.data)
      }
    }
  })

  /**
   *  
   * Lobby handling 
   * 
   **/
  client.on('build_lobby',async(lobby_name,max_stars,token)=>  {
    const user = await user_authenticated(token)
    if(user[0]){
      console.log("a user built a lobby")
      build_lobby(lobby_name,client,max_stars)
      const {data: lobbies} = get_lobbies()
      client.emit("lobbies",lobbies)
    }else{
      client.emit("token_error",user[1])
    }
  })

  client.on('get_lobbies',async (stars,token) => {
    const user = await user_authenticated(token)
    if(user[0]){
      console.log("a user requested lobbies")
      const {data: lobbies} = get_lobbies(stars)
      client.emit("lobbies",lobbies)
    }else{
      client.emit("token_error",user[1])
    }
  })

  client.on('join_lobby', async(lobby_id,token) => {
    const user = await user_authenticated(token)
    if(user[0]){
      console.log("a user joined a lobby")
      if(online_users.has(client.id)){
        const player = online_users.get(client.id)
        if(lobbies.has(lobby_id)){
          const host = lobbies.get(lobby_id).getPlayers()[0]
          if(join_lobby(lobby_id,client,player)){
            try{
              const {data: board} = await axios.put(game_service+"/game/lobbies/create_game",{game_id: lobby_id,host_id:host,opponent:player})
              io.to(lobby_id).emit("game_started",board)
              turn_timeouts.set(lobby_id, setTimeout(turn_timeout(lobby_id),process.env.TIMEOUT))
            }catch(err){
              if(err.response.status == 500){
                client.emit("server_error",err.response.data)
              }
            }
          }else{
            client.emit("join_err")
          }
        }
      }
    }else{
      client.emit("token_error",user[1])
    }
  })

  client.on('delete_lobby', async(lobby_id,token) =>{
    const user = await user_authenticated(token)
    if(user[0]){
      console.log("a user deleted a lobby")
      if(online_users.has(client.id) && lobbies.has(lobby_id)){
        const player = online_users.get(client.id)
        const lobby = lobbies.get(lobby_id)
        if(lobby.hasPlayer(player) 
        && lobby.isFree 
        && delete_lobby(lobby_id)){
          lobbies.delete(lobby_id)
          client.emit("lobby_deleted")
        }else{
          client.emit("error_deleting")
        }
      }
    }else{
      client.emit("token_error",user[1])
    }
  })
  client.on('invite_opponent',async(token,opponent_mail) =>{
    const user_mail = online_users.get(client.id)
    const user = await user_authenticated(token)
    if(user[0] 
    && online_users.has(client.id) 
    && online_users.hasValue(opponent_mail)
    //THIS WON't WORK
    && lobbies.filter(lobby => {
        lobby.hasPlayer(opponent_mail)
      }) === null 
    && lobbies.filter(lobby => {
      lobby.hasPlayer(opponent_mail)
    }) === null)
    {
      const opponent_id = online_users.getKey(opponent_mail)
      io.to(opponent_id).emit("lobby_invitation",opponent_mail)
      invitations.set(user_mail,opponent_id)
      invitation_timeouts.set(user_mail, setTimeout(invitation_timeout(user_mail),process.env.TIMEOUT))
    }else{
      client.emit("token_error",user[1])
    }
  })
  
  //WILL IT WORK?
  client.on('accept_invite',async(token,opp_mail)=>{
    const user = await user_authenticated(token)
    if(user[0]){
      if(invitations.get(opp_mail) === null){
        client.emit('invitation_expired')
      }else{
        const user_mail = online_users.get(client.id)
        //WILL THIS WORK?
        let opponent = io.sockets.sockets.get(opp_mail);
        //
        let lobby_id = build_lobby(opp_mail+"-"+user_mail,opponent,Number.MAX_VALUE)
        if(join_lobby(lobby_id,client,online_users.get(client.id))){
          try{
            const {data: board} = await axios.put(game_service+"/game/lobbies/create_game",{game_id: lobby_id,host_id:opp_mail,opponent:user_mail})
            io.to(lobby_id).emit("game_started",board)
            turn_timeouts.set(lobby_id, setTimeout(turn_timeout(lobby_id),process.env.TIMEOUT))
          }catch(err){
            if(err.response.status == 500){
              client.emit("server_error",err.response.data)
            }
          }
        }
      }
    }else{
      client.emit("token_error",user[1])
    }
    
  })

  client.on('decline_invite',async(token,opp_id)=>{
    const user = await user_authenticated(token)
    if(user[0]){
      const invitation = invitation.get(opp_id)
      if(invitation === null){
        client.emit("invitation_expired")
      }else{
        io.to(opp_id).emit("invitation_declined")
        invitation.delete(opp_id)
      }
    }else{
      client.emit("token_error",user[1])
    }
  })
  /**
   * 
   * Game handling
   * 
   */
  client.on('move_piece',async (lobby_id,from,to,token) =>{
    const user = await user_authenticated(token)
    if(user[0]){
      console.log("a user moved a piece")  
      if(online_users.has(client.id) && lobbies.has(lobby_id)){
        let player = online_users.get(client.id)
        var lobby = lobbies.get(lobby_id)
        //is == ok down here? ->
        if(lobby.hasPlayer(player) && lobby.turn == player.turn){
          try{
            let {data: data} = await axios.put(game_service+"/game/movePiece",{game_id: lobby_id,from:from,to:to})
            if(data.winner === ""){
              io.to(lobby_id).emit("update_board",data.board)
              change_turn(lobby_id)
            }else{
              if(updatePoints(data.winner,process.env.WIN_STARS,data.loser,process.env.LOSS_STARS)){
                io.to(lobby_id).emit("game_ended",data)
                delete_lobby(lobby_id)
              }
            }
          }catch(err){
            if(err.response.status == 400){
              client.emit("client_error",err.response.data)
            }
          }fi
        }else{
          client.emit("permit_error")
        }
      }else{
        client.emit("permit_error")
      }
    }else{
      client.emit("token_error",user[1])
    }
  })
  client.on('leave_game',async(lobby_id,token) => {
    const user = await user_authenticated(token)
    let result = null
    if(user[0]){
      let player = online_users.get(client.id)
      if(lobbies.has(lobby_id) && lobbies.get(lobby_id).hasPlayer(player)){
        try{
          result = await axios.delete(game_service+"/game/leaveGame",{game_id: lobby_id, player_id: player})
        }catch(err){
          if(err.response.status == 500){
            client.emit("server_error",err.response.data)
          }
        }
        result = result.data
        client.emit("left_game",result[0])
        let lobby = lobbies.get(lobby_id)
            //will those two lines below work??
        let winner = lobby.getPlayers().splice(lobby.indexOf(player),1)
        io.sockets.get(online_users.getKey(winner)).emit("opponent_left",result[1])
      }else{
        client.emit("permit_error")
      }
    }else{
      client.emit("token_error",user[1])
    }
  })

  client.on('tie_game',async(lobby_id,token) =>{
    const user = await user_authenticated(token)
    if(user[0]){
      let player = online_users.get(client.id,token)
      if(lobbies.has(lobby_id) && lobbies.get(lobby_id).hasPlayer(player)){
        let lobby = lobbies.get(lobby_id)
        io.to(lobby_id).emit("tie_proposal",player)
        lobby.tieProposal();
        if(lobby.tie()){
          try{
            let {data:result} = await axios.put(game_service+"/game/tieGame",{game_id: lobby_id})
            io.to(lobby_id).emit("tie_game",result)
          }catch(err){
            if(err.response.status == 500){
              client.emit("server_error",err.response.data)
            }
          }
        }
      }else{
        client.emit("permit_error")
      }
    }else{
      client.emit("token_error",user[1])
    }
  })

  client.on('game_history',async(lobby_id,token)=>{
    const user = await user_authenticated(token)
    if(user[0]){
      if(lobbies.has(lobby_id) && lobbies.get(lobby_id).hasPlayer(online_users.get(client.id))){
        try{
          let history = await axios.get(game_service+"/game/history",{game_id : lobby_id})
          client.emit("game_history",history)
        }catch(err){
          if(err.response.status == 500){
            client.emit("server_error",err.response.data)
          }
        }
      }else{
        client.emit("permit_error")
      }
    }else{
      client.emit("token_error",user)
    }
  })

  /**
   * 
   * CHAT HANDLING
   * 
   */
  client.on('global_msg',async(msg,token)=>{
    const user = await user_authenticated(token)
    if(user[0]){
      console.log("a user sent a global-msg")
      if(online_users.has(client.id)){
        io.emit("global_msg",{sender:online_users.get(client.id), message:msg})
      }
    }else{
      client.emit("token_error",user[1])
    }
  })


  client.on('game_msg',async(lobby_id,msg,token)=>{
    const user = await user_authenticated(token)
    if(user[0]){
      console.log("a user sent a game msg")
      if(online_users.has(client.id) && lobbies.has(lobby_id)
      && lobbies.get(lobby_id).getPlayers.includes(online_users.get(client.id))){
        io.to(lobby_id).emit("game_msg",{sender:online_users.get(client.id), message:msg})
      }
    }else{
      client.emit("token_error",user[1])
    }
  })

  /**
   * 
   * USER PROFILE HANDLING
   * 
   */
  client.on('get_profile',async(token) =>{
    const user = await user_authenticated(token)
    if(user[0]){
      let user_id = online_users.get(client.id)
      try{
        let user_profile = await axios.get(user_service+"/profile/getProfile",{user_id:user_id})
        if(!user_profile === null){
          client.emit("permit_error",user_profile)
        }else{
          client.emit("user_profile",user_profile)
        }
      }catch(err){
        if(err.response.status == 500 ){
          client.emit("server_error",err.response.data)
        }else if(err.response.status == 404){
          client.emit("client_error",err.response.data)
        }
      }
    }else{
      client.emit("token_error",user[1])
    }
  })

  client.on('get_leaderboard',async(token) =>{
    const user = await user_authenticated(token)
    if(user[0]){
      try{
        let leaderboard = await axios.get(user_service+"/getLeaderboard")
        if(leaderboard === null){
          client.emit("permit_error",leaderboard)
        }else{
          client.emit("leaderboard",leaderboard)
        }
      }catch(err){
        client.emit("server_error",err.response.data)
      }

    }else{
      client.emit("token_error",user[1])
    }
  })

  client.on('update_profile',async(params,token) =>{
    const user = await user_authenticated(token)
    if(user[0]){
      const user_id = online_users.get(client.id)
      const updated_user = await axios.put(user_service+"/profile/updateProfile",{user_id:user_id,params:params})
      if(updated_user === null){
        client.emit("permit_error",user_history)
      }else{
        client.emit("updated_user",updated_user)
      }
    }else{
      client.emit("token_error",user[1])
    }
  })

  client.on('get_history', async(token) => {
    const user = await user_authenticated(token)
    if(user[0]){
      let user_id = online_users.get(client.id)
      let user_history = await axios.get(user_service+"/profile/getHistory",{user_id : user_id})
      if(user_history === null){
        client.emit("permit_error",user_history)
      }else{
        client.emit("user_history",user_history)
      }
    }else{
      client.emit("token_error",user[1])
    }
  })
});
} 
