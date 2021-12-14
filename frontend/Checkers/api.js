const socket = this

function getToken(){
    return sessionStorage.token
}

var api = {
    signup(socket,email,password,username,first_name,last_name){
        socket.emit("signup",email,password,username,first_name,last_name)
    },
    login(socket,email,password){
        socket.emit("login",email,password)
    },
    build_lobby(socket,name,max_stars){
        socket.emit("build_lobby",name,max_stars,getToken())
    },
    get_lobbies(socket,stars){
        socket.emit("get_lobbies",stars,getToken())
    },
    join_lobby(socket, lobby_id){
        socket.emit("join_lobby",lobby_id,getToken())
    },
    delete_lobby(lobby_id) {
        socket.emit("delete_lobby",lobby_id,getToken())
    },
    get_leaderboard(socket){
        socket.emit("get_leaderboard",getToken())
    },
    get_history(socket){
        socket.emit("get_history",getToken())
    },
    get_profile(socket){
        socket.emit("get_profile",getToken())
    },
    update_profile(socket,params){
        socket.emit("update_profile",params,getToken())
    },

    //Can try
    leave_game(lobby_id){
        socket.emit("leave_game",lobby_id,getToken())
    },
    tie_game(lobby_id){
        socket.emit("tie_game",lobby_id,getToken())
    },
    game_history(lobby_id){
        socket.emit("game_history",lobby_id,getToken())
    },
    move_piece(lobby_id,from,to){
        socket.emit("move_piece",lobby_id,from,to,getToken())
    },
    global_msg(msg){
        socket.emit("global_msg",msg,getToken())
    },
    game_msg(lobby_id,msg){
        socket.emit("game_msg",lobby_id,msg,getToken())
    },




}
export default api