const BiMap = require('bidirectional-map')
const axios = require('axios');
const socket = require("socket.io")
var Lobby = require('../models/lobby')


//TURN HANDLING 
let online_users = new BiMap()  //{  client_id <-> user_id  }
let lobbies = new Map(); // { lobby_id -> Lobby }
let turn_timeouts = new Map(); // {client_id -> timoutTimer}
var current_id = 0;
var free_ids = []
/** 
 * lobby: {
 *      name
        maxStars,
        addPlayer(),
        removePlayer(),
        isFree(),
        getPlayers()
   }
 * */ 
exports.socket = async function(server) {
    const io = socket(server)


let timeOut;
const MAX_WAITING = 20000;
/**
 * Missing:
 * - fix req.params in req.body
 * */

const game_service = process.env.HOSTNAME+process.env.GAME_SERVICE_PORT
const user_service = process.env.HOSTNAME+process.env.USER_SERVICE_PORT

function get_id(){
  if(free_ids.length > 0){
    return free_ids.shift()
  }else{
    let new_id = current_id
    current_id++
    return new_id
  }
}


function build_lobby(room_name,client,maxStars){
  lobbies.set(get_id(),new Lobby(maxStars,room_name,online_users.get(client.id)))
  client.join(room_name)
}
async function delete_lobby(game_id){
  let deleted = await Game.findOneAndDelete({"game_id":game_id,"black":""})
      return deleted && games.delete(game_id) && free_ids.push(game_id)
      //&& last_black_pieces.delete(game_id)
      //&& last_white_pieces.delete(game_id) 
}

function join_lobby(room_name,client){
  let to_join = lobbies.get(room_name)
  if(to_join != null && to_join.isFree()){
      return to_join.addPlayer(client)
  }else{
    return false
  }
}
function get_lobbies(user_stars){
  let available_lobbies = []
  lobbies.forEach((lobby_id,lobby)=>{
    //SHould I just return the whole lobby item?
    if(lobby.isFree && lobby.maxStars >= user_stars){
      var tmpLobby = new Object();
      tmpLobby.id = lobby_id
      tmpLobby.name = lobby.name
      tmpLobby.maxStars = lobby.maxStars
      tmpLobby.host = lobby.getPlayers(0)
      available_lobbies.push(tmpLobby)
    }
  })
  return available_lobbies
}

io.on('connection', async client => {
  //A new anon user just connected, push it to online_players
  online_users.set(client.id,get_id())

  client.on('disconnect', function(){
    console.log('A player disconnected');
    //Remove player from active players
    online_users.deleteValue(client)
    });


  client.on('login', async mail => {
    //Update user id in online_users
    //TODO maybe should receive mail and
    //search in DB for the corresponding username
    online_users.set(client.id,mail)
  })


  /**
   *  
   * Lobby handling 
   * 
   **/
  client.on('build_lobby',async (lobbyName,maxStars) => {
    build_lobby(lobbyName,client,maxStars)
    let {data: lobbies} = get_lobbies()
    client.emit("lobbies",lobbies)
  })

  client.on('get_lobbies',async (stars) => {
    let {data: lobbies} = get_lobbies(stars)
    client.emit("lobbies",lobbies)
  })

  client.on('delete_lobby', async(lobby_id) => {
    lobbies.delete(lobby_id)
  })
function triggered_timeout(lobby_id){

  clearTimeout(turn_timeouts.get(game.id));
  change_turn(lobby_id)
}
function change_turn(lobby_id){
  let lobby = lobbies.get(lobby_id)
  let lobbyPlayers = lobby.getPlayers()
  let late_player = lobby.turn
  let next_player = lobbyPlayers.splice(lobbyPlayers.indexOf(late_player),1)
  return lobbies.get(lobby_id).turn = next_player &&
  turn_timeouts.set(lobby_id, setTimeout(triggered_timeout(lobby_id),process.env.TIMEOUT))
}

  client.on('join_lobby', async(lobby_id) => {
    if(online_users.has(client.id)){
      let player = online_users.get(client.id)
      if(lobbies.has(lobby_id)){
        if(join_lobby(lobby_id,client,player)){
          let {data: board} = await axios.put(game_service+"/game/lobbies/create_game",{lobby_id: lobby_id})
          io.to(lobby_id).emit("game_started",board)
          turn_timeouts.set(lobby_id, setTimeout(triggered_timeout(lobby_id),process.env.TIMEOUT))
        }else{
          client.emit("join_err")
        }
      }
    }
  })
  client.on('delete_lobby', async(lobby_id)=>{
    if(online_users.has(client.id) && lobbies.has(lobby_id)){
      let player = online_users.get(client.id)
      let lobby = lobbies.get(lobby_id)
      if(lobby.getPlayers().includes(player) && lobby.isFree 
      && delete_lobby(lobby_id)){
        lobbies.delete(lobby_id)
        client.emit("lobby_deleted")
      }else{
        client.emit("something wrong while deleting your lobby")
      }
    }
  })
  /*
  * Game handling
  */
  client.on('movePiece',async (lobby_id,from,to) =>{
    let player = online_users.get(client.id)
    var lobby = lobbies.get(lobby_id)
    if(lobby != null && lobby.hasPlayer(player)){
      let {data: data} = await axios.put(game_service+"/game/movePiece",{game_id: lobby_id,from:from,to:to})
      if(data.winner === ""){
        io.to(lobby_id).emit("update_board",data.board)
        if(change_turn(lobby_id)){
          io.to(lobby_id).emit("turn_change",{next_player:to_play,other:other})
        }else{
          io.to(lobby_id).emit("error while changing turn")
        }
      }else{
        io.to(lobby_id).emit("game_ended",data)
      }
    }
  })
  client.on('leave_game',async(lobby_id) => {
    let player = online_users.get(client.id)
    let {data:result} = await axios.delete(game_service+"/game/leaveGame",{game_id: lobby_id, player_id: player})
    client.emit("left_game",result[0])

    let lobby = lobbies.get(lobby_id)
        //will those two lines below work??
    let winner = lobby.getPlayers().splice(lobby.indexOf(player),1)
    io.sockets.get(online_users.getKey(winner)).emit("opponent_left",result[1])
  })
  client.on('tie_game',async(lobby_id) =>{
    let lobby = lobbies.get(lobby_id)
    io.to(lobby_id).emit("tie_proposal",online_users.get(client.id))
    lobby.tieProposal();
    if(lobby.tie()){
      let {data:result} = await axios.put(game_service+"/game/tieGame",{game_id: lobby_id})
      io.to(lobby_id).emit("tie_game",result)
    }
  })
  client.on('game_history',async(lobby_id)=>{
    let history = await axios.get(game_service+"/game/history",{game_id : lobby_id})
    client.emit("game_history",history)
  })
  });

  /**
   * CHAT HANDLING
   */
  client.on('global_msg',async(sender,msg)=>{
    if(online_users.has(sender)){
      io.emit("global_msg",{sender:sender, message:msg})
    }
  })
  client.on('game_msg',async(lobby_id,sender,msg)=>{
    if(online_users.has(sender) && lobbies.has(lobby_id)
    && lobbies.get(lobby_id).getPlayers.includes(sender)){
      io.to(lobby_id).emit("game_msg",{sender:sender, message:msg})
    }
  })

}