const socket = this

function getToken(){
    return localStorage.token
}

var api = {
    handleError(error,errorHandler){
        if(error){
            errorHandler(error)
        }
        console.log("ERROR" + error)
    },
    signup(socket,email,password,username){
        socket.emit("signup",email,password,username)
    },
    login(socket,email,password){
        socket.emit("login",email,password)
    },
    build_lobby(name,max_stars){
        socket.emit("build_lobby",name,max_stars,getToken)
    },
    get_lobbies(stars){
        socket.emit("get_lobbies",stars,getToken)
    },
    join_lobby(lobby_id){
        socket.emit("join_lobby",lobby_id,getToken)
    },
    delete_lobby(lobby_id) {
        socket.emit("delete_lobby",lobby_id,getToken)
    },
    move_piece(lobby_id,from,to){
        socket.emit("move_piece",lobby_id,from,to,getToken)
    },
    leave_game(lobby_id){
        socket.emit("leave_game",lobby_id,getToken)
    },
    tie_game(lobby_id){
        socket.emit("tie_game",lobby_id,getToken)
    },
    game_history(lobby_id){
        socket.emit("game_history",lobby_id,getToken)
    },
    global_msg(msg){
        socket.emit("global_msg",msg,getToken)
    },
    game_msg(lobby_id,msg){
        socket.emit("game_msg",lobby_id,msg,getToken)
    },
    get_profile(){
        socket.emit("get_profile",getToken)
    },
    get_leaderboard(){
        socket.emit("get_profile",getToken)
    },
    update_profile(params){
        socket.emit("update_profile",params,getToken)
    },
    get_history(){
        socket.emit("get_history",getToken)
    }
}
export default api