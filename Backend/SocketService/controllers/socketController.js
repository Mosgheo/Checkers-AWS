const axios = require('axios');
const socket = require("socket.io")
var Lobby = require('../models/lobby')

//TURN HANDLING 
let online_users = new Map();  //{  client_id -> user_id  }
let lobbies = new Map(); // { lobby_id -> Lobby }
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
var current_id = 0;
var free_ids = []
let timeOut;
const MAX_WAITING = 20000;


const game_service = process.env.HOSTNAME+process.env.GAME_SERVICE_PORT
const user_service = process.env.HOSTNAME+process.env.USER_SERVICE_PORT

function map_as_bi_map(toMatch){
  online_users.forEach((key,value) =>{
    if(toMatch === value){
      return key
    }
  })
}
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
  lobbies.set(get_id(),new Lobby(maxStars,room_name))
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
  online_users.push(client.id,client)

  client.on('disconnect', function(){
    console.log('A player disconnected');
    //Remove player from active players
    online_users.delete(client)
    });


  client.on('login', async mail => {
    //Update user id in online_users
    online_users.set(client,mail)
    online_users.delete(client.id)
  })


  /**
   *  
   * Lobby handling 
   * 
   * */
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

  client.on('join_lobby', async(lobby_id) => {
    let player = online_users.get(client.id)
    if(join_lobby(lobby_id,client,player)){
      let {data: board} = await axios.put(game_service+"/game/lobbies/create_game",{lobby_id: lobby_id})
      io.to(lobby_id).emit("game_started",board)
    }else{
      client.emit("join_err")
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
      }else{
        io.to(lobby_id).emit("game_ended",data)
      }
    }
  })
  client.on('leave_ame',async(lobby_id) => {
    let player = online_users.get(client.id)
    let {data:result} = await axios.delete(game_service+"/game/leaveGame",{game_id: lobby_id, player_id: player})
    client.emit("left_game",result[0])
    //will it work??
    let lobby = lobbies.get(lobby_id)
    let winner = lobby.getPlayers().splice(lobby.indexOf(player),1)
    io.sockets.get(map_as_bi_map(winner)).emit("opponent_left",result[1])
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
}