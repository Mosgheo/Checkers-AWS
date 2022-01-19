const BiMap = require('bidirectional-map')
const { default: axios } = require('axios');
const socket = require("socket.io")
require("dotenv").config()
const Lobby = require('../models/lobby');

//TURN HANDLING 
const online_users = new BiMap()  //{  client_id <-> user_id  }
const lobbies = new BiMap(); // { lobby_id -> Lobby }
const turn_timeouts = new Map(); // {lobby_id -> timoutTimer}

const invitations = new Map() // {host_id -> opponent_id}
const invitation_timeouts = new Map() // {inv_id -> timeout}

const game_service = process.env.GAME_SERVICE
const user_service =process.env.USER_SERVICE

let current_id = 0;
let free_ids = []

exports.socket = async function(server) {
    const io = socket(server, {
      cors: {
        origin: '*',
      }
    })

/**
 * +
 * Missing:
 * */
 
function get_id(){
  if(free_ids.length > 0){
    return free_ids.shift()
  }else{
    let new_id = current_id
    current_id++
    return new_id.toString()
  }
}
function isInLobby(player_mail){
  for(const [_,lobby] of lobbies.entries()){
    if(lobby.hasPlayer(player_mail)){
      return true
    }
  }
  return false
}
function isOnline(player_id){
  return online_users.has(player_id)
}
//WILL IT WORK ???
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

function build_lobby(room_name,client,max_stars){
  const room_id = get_id()
  console.log("JUST BUILT THIS LOBBY "+room_id)
  lobbies.set(room_id,new Lobby(max_stars,room_name,online_users.get(client.id)))
  client.join(room_id)
  return room_id
}

function delete_lobby(lobby_id){
  lobbies.delete(lobby_id)
  free_ids.push(lobby_id)
  clearTimeout(turn_timeouts.get(lobby_id))
  turn_timeouts.delete(lobby_id)
}

function join_lobby(lobby_id,client,player){
  if(lobbies.has(lobby_id)){
    console.log("lobby has id")
    const to_join = lobbies.get(lobby_id)
    if(to_join.isFree()){
      console.log("lobby is free")
      console.log("weee" + lobbies.get(lobby_id).getPlayers())
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

async function getUsername(mail){
  try{
    console.log(mail)
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
    console.log(lobby)
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
function invitation_timeout(inv_id){
  invitations.delete(inv_id)
  io.to(inv_id).emit("invitation_timeout")
}

function change_turn(lobby_id){
  console.log("Changint turns for game "+lobby_id)
  let lobby = lobbies.get(lobby_id)
  let lobbyPlayers = lobby.getPlayers()
  let late_player = lobby.turn
  let next_player = lobbyPlayers.filter(player => player !== late_player)[0]
  console.log(next_player)
  console.log(late_player)
  lobbies.get(lobby_id).turn = next_player 
  clearTimeout(turn_timeouts.get(lobby_id))
  turn_timeouts.set(lobby_id, setTimeout(function () {
    change_turn(lobby_id)
    console.log("TURN TIMEOUT FOR GAME " + lobby_id)
  },process.env.TIMEOUT))
  io.to(lobby_id).emit("turn_change",{next_player:next_player})
}

async function updatePoints(winner,points1,loser,points2){
  try{
      const {data:updated_one} = await axios.put(user_service+"/profile/updatePoints",
      {
        mail : winner,
        stars: points1,
        won: true
      })
      const{data:updated_two} = await axios.put(user_service+"/profile/updatePoints",
      {
          mail : loser,
          stars: points2,
          won:false
      })
     return [updated_one,updated_two]
    }catch(err){
      console.log(err)
      return []
    }
}
async function handle_disconnection(player){
  const client_id = online_users.getKey(player)
  if(!isInLobby(player)){
    console.log(player + "just disconnected but wasn't in lobby")
    online_users.delete(client_id)
  }else{
    const lobby = Array.from(lobbies.values()).filter(lobby => lobby.hasPlayer(player))[0]
    let lobby_id = lobbies.getKey(lobby)
    console.log(player + "from lobby" + lobby_id + " is  trying to disconnect")
    if(lobby.isFree()){
      console.log("lobby "+lobby_id+ "is free")
      console.log(online_users.get(client_id)+" just disconnected and his lobby has been deleted")
      lobbies.delete(lobby_id)
      online_users.delete(client_id)
    }else{
      console.log("lobby"+lobby_id +"isn't free")
      try{
        let opponent = ""
        //Player disconnecting is the host
        if(lobby.getPlayers(0) == player){
          const {data:game_end} = await axios.post(game_service+"/game/deleteGame",{game_id:lobby_id,winner:lobby.getPlayers(1),forfeiter:lobby.getPlayers(0)})
          opponent = lobby.getPlayers(1)
          io.to(lobby_id).emit("player_left",game_end)
          console.log(player +" is the host, deleting game")
        }
        else{
          console.log(player +" isn't the host, deleting game")
          const {data:game_end} = await axios.post(game_service+"/game/deleteGame",{game_id:lobby_id,winner:lobby.getPlayers(0),forfeiter:lobby.getPlayers(1)})
          io.to(lobby_id).emit("player_left",game_end)
          opponent = lobby.getPlayers(0)
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
        if('response' in err){
          if(err.response.status == 500){
            io.to(lobby_id).emit("server_error",err.response.data)
          }
        }
      }
    }
  }
}

io.on('connection', async client => {
  console.log("a user connected")
  //A new anon user just connected, push it to online_players
  online_users.set(client.id,get_id())
  client.on('disconnect', async()=>{
    console.log('A player disconnected');
    //Remove player from active players
    const player = online_users.get(client.id)
    await handle_disconnection(player)
  });
  //client.on('logout', await handle_disconnection(online_users.get(client.id)).then(online_users.set(client.id,get_id())));

  client.on('login', async (mail,password) => {
    console.log("a user is tryng to log in")
    //Update user id in online_users
    //TODO maybe should receive mail and
    //search in DB for the corresponding username
    if(online_users.hasValue(mail)){
      client.emit("login_error","Someone is already logged in with such email")
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
        if('response' in err){
          if(err.response.status == 400){
            client.emit("login_error",err.response.data)
          }
        }
      }
    }
  })

  client.on('signup',async(mail,password,username,first_name,last_name)=>{
    console.log("a user is trying to sign up")
    try{
      let {data:new_user} = await axios.post(user_service+"/signup",{
          first_name: first_name,
          last_name: last_name,
          email: mail,
          password: password,
          username: username
        })
        client.emit('signup_success',new_user)
    }catch(err){
      if('response' in err){
        if(err.response.status == 400 || err.response.status == 500){
          client.emit('signup_error',err.response.data)
        }
      }
      console.log("Signup_err",err)
    }
  })
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
          if('response' in err){
            if(err.response.status == 500){
              client.emit("token_error",err.response.data)
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
   *  
   * Lobby handling 
   * 
   **/
   client.on('build_lobby',async(lobby_name,max_stars,token)=>  {
    if(isOnline(client.id) && !isInLobby(online_users.get(client.id))){
        const user = await user_authenticated(token,client.id)
      if(user[0]){
        console.log("He is actually authenticated lol, how so?")
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
        client.emit("token_error",user[1])
      }
    }else{
      console.log("a user tried bulding a lobby while already has one")
      client.emit("permit_error",{message:"Player is either online or is already in some lobby."})
    }
  })


  client.on('get_lobbies',async (stars,token) => {
    if(isOnline(client.id)){
      const user = await user_authenticated(token,client.id)
      if(user[0]){
        console.log("a user requested lobbies")
        const lobbies = await get_lobbies(stars)
        console.log("emitting lobbies")
        client.emit("lobbies",lobbies)
      }else{
        client.emit("token_error",user[1])
      }
    }else{
      client.emit("permit_error", {message:"Player is offline in some funny way."})
    }
  })

  client.on('join_lobby', async(lobby_id,token) => {
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      console.log("a user joined a lobby")
      if(isOnline(client.id) && !isInLobby(online_users.get(client.id))){
        const opponent = online_users.get(client.id)
        if(lobbies.has(lobby_id)){
          //HOW SHOULD WE USE GET PARAMS????
          /*const host = await axios.get(user_service+"/getProfile",{
            mail:mail,
          })*/
          const host = lobbies.get(lobby_id).getPlayers()[0]
          if(join_lobby(lobby_id,client,opponent)){
            console.log("join ok")
            try{
              let game = []
              const {data:host_specs} = await axios.get(user_service+"/profile/getProfile",
              {params:
                {
                  mail:host
                }
              })
              const {data:opponent_specs} = await axios.get(user_service+"/profile/getProfile",
              {params:
                {
                  mail:opponent
                }
              })
              const {data: board} = await axios.post(game_service+"/game/lobbies/create_game",{game_id: lobby_id,host_id:host_specs.mail,opponent:opponent_specs.mail})
              game.push(host_specs)
              game.push(opponent_specs)
              game.push(board)
              game.push(lobby_id)
              console.log("GAME "+game)
              io.to(lobby_id).emit("game_started",game)
              console.log("PUTTANA MADONNA" +JSON.stringify(lobbies))
              turn_timeouts.set(lobby_id, setTimeout(function(){
                change_turn(lobby_id)
                console.log("TURN TIMEOUT FOR GAME " + lobby_id)
              },process.env.TIMEOUT))
              console.log("Timeout set for game" + lobby_id)
            }catch(err){
              console.log(err)
              if('response' in err){
                if(err.response.status == 500){
                  client.emit("server_error",err.response.data)
                  console.log("WELA 500")
                }else if(err.response.status == 404){
                  console.log("WELA 404")
                  client.emit("permit_error",err.response.data)
                }
              }
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
      client.emit("token_error",user[1])
    }
  })

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
        }else{
          client.emit("server_error",{message:"There has been some problem with the process of deleting a lobby."})
        }
      }
    }else{
      client.emit("token_error",user[1])
    }
  })
  client.on('invite_opponent',async(token,opponent_mail) =>{
    const user_mail = online_users.get(client.id)
    const user = await user_authenticated(token,client.id)
    if(user[0] 
      && online_users.has(client.id) 
      && online_users.hasValue(opponent_mail)
      //THIS WON't WORK
      && lobbies.filter(lobby => lobby.hasPlayer(opponent_mail)) === null 
      && lobbies.filter(lobby => lobby.hasPlayer(opponent_mail)) === null)
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
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      if(invitations.get(opp_mail) === null){
        client.emit('invitation_expired',{message:"Your invitation for this lobby has expired"})
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
            turn_timeouts.set(lobby_id, setTimeout(function(){
              change_turn(lobby_id)
              console.log("TURN TIMEOUT FOR GAME " + lobby_id)
            },process.env.TIMEOUT))
          }catch(err){
            if('response' in err){
              if(err.response.status == 500){
                client.emit("server_error",err.response.data)
              }
            }
            console.log(err)
          }
        }
      }
    }else{
      client.emit("token_error",user[1])
    }
    
  })

  client.on('decline_invite',async(token,opp_id)=>{
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      const invitation = invitation.get(opp_id)
      if(invitation === null){
        client.emit("invitation_expired",{message:"Your invitation for this lobby has expired"})
      }else{
        io.to(opp_id).emit("invitation_declined",{message:online_users.get(opp_id)+" has just refused your invite, we're so sry. "})
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
            if(move_result.winner === "" || move_result.winner === undefined){
              io.to(lobby_id).emit("update_board",move_result.board)
              change_turn(lobby_id)
            }else{
              try{
                console.log("winner: "+move_result.winner)
                console.log("loser: "+move_result.loser)
                const updated_users = await updatePoints(move_result.winner,process.env.WIN_STARS,move_result.loser,process.env.LOSS_STARS)
                if(updated_users.length !== 0){
                  io.to(lobby_id).emit("update_board",move_result.board)
                  io.to(lobby_id).emit("game_ended",{
                    winner: (move_result.winner === updated_users[0].mail ? updated_users[0] : updated_users[1]),
                    loser: (move_result.loser === updated_users[0].mail ? updated_users[0] : updated_users[1])
                  })
                  console.log("Successfully sent end_game")
                  delete_lobby(lobby_id)
                  io.in(lobby_id).socketsLeave(lobby_id);
                }else{
                  console.log("Something wrong while updating points.")
                  client.emit("server_error",{message:"Something wrong while updating points."})
                }

              }catch(err){
                if('response' in err){
                  if(err.response.status == 500){
                    client.emit("server_error",err.response.data)
                  }
                }
                console.log(err)
              }
            }
          }catch(err){
            if('response' in err){
              if(err.response.status == 400){
                client.emit("client_error",err.response.data)
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
      client.emit("token_error",user[1])
    }
  })

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
          result = await axios.delete(game_service+"/game/leaveGame",{game_id: lobby_id, player_id: player})
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
          io.in(lobby_id).socketsLeave(lobby_id);
        }catch(err){
          if('response' in err){
            if(err.response.status == 500){
              client.emit("server_error",err.response.data)
            }
          }
          console.log(err)
        }
      }else{
        console.log(player+" permit error")
        client.emit("permit_error",{message:"I don't know which lobby you're referring to and even if I knew you're not in it"})
      }
    }else{
      client.emit("token_error",user[1])
    }
  })

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
            if('response' in err){
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

  client.on('game_history',async(lobby_id,token)=>{
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      if(lobbies.has(lobby_id) && lobbies.get(lobby_id).hasPlayer(online_users.get(client.id))){
        try{
          let history = await axios.get(game_service+"/game/history",{game_id : lobby_id})
          client.emit("game_history",history)
        }catch(err){
          if('response' in err){
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

  /**
   * 
   * CHAT HANDLING
   * 
   */
  client.on('global_msg',async(msg,token)=>{
    const user = await user_authenticated(token,client.id)
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
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      console.log("a user sent a game msg")
      console.log(online_users)
      if(online_users.has(client.id) && lobbies.has(lobby_id)
      && lobbies.get(lobby_id).getPlayers().includes(online_users.get(client.id))){
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
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      let user_id = online_users.get(client.id)
      try{
        let user_profile = await axios.get(user_service+"/profile/getProfile",              
        {params:
          {
            mail:user_id
          }
        })
        if(!user_profile === null){
          client.emit("permit_error",user_profile)
        }else{
          client.emit("user_profile",user_profile)
        }
      }catch(err){
        if('response' in err){
          if(err.response.status == 500 ){
            client.emit("server_error",err.response.data)
          }else if(err.response.status == 404){
            client.emit("client_error",err.response.data)
          }
        }
        console.log(err)
      }
    }else{
      client.emit("token_error",user[1])
    }
  })

  client.on('get_leaderboard',async(token) =>{
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      try{
        console.log("Someone asked for a leaderboard")
        let {data:leaderboard} = await axios.get(user_service+"/getLeaderboard")
        if(leaderboard === null){
          client.emit("permit_error",leaderboard)
        }else{
          client.emit("leaderboard",leaderboard)
        }
      }catch(err){
        console.log(err)
        client.emit("server_error",err.response.data)
      }
    }else{
      client.emit("token_error",user[1])
    }
  })

  client.on('update_profile',async(params,token) =>{
    console.log("UPDATING SOME PROFILE YO")
    const user = await user_authenticated(token,client.id)
    if(user[0]){
      const user_mail = online_users.get(client.id)
      const {data:updated_user} = await axios.put(user_service+"/profile/updateProfile",{mail:user_mail,params:params})
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
      console.log(typeof user_history)
      for( const game  of user_history) {
        let winner_profile = ""
        let loser_profile = ""
        if(!users_avatar.has(game.winner)){
          console.log("havent' got winner "+game.winner)
          try{
            winner_profile = await axios.get(user_service+"/profile/getProfile",              
            {params:
              {
                mail:game.winner
              }
            })
          }catch(err){
            console.log(err)
            console.log("Something went wrong while requesting avatar for user history")
          }
          users_avatar.set(game.winner,{
            avatar: winner_profile.data.avatar,
            username:winner_profile.data.username})
        }
        if(!users_avatar.has(game.loser)){
          console.log("haven't got loser "+ game.loser)
          try{
            loser_profile = await axios.get(user_service+"/profile/getProfile",              
            {params:
              {
                mail:game.loser
              }
            })
          }catch(err){
            console.log("Something went wrong while requesting avatar for user history")
          }
          users_avatar.set(game.loser,{
             avatar:loser_profile.data.avatar,
             username:loser_profile.data.username
            })
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
        client.emit("permit_error",user_history)
      }else{
        client.emit("user_history",data)
      }
    }else{
      client.emit("token_error",user[1])
    }
  })
});
} 
