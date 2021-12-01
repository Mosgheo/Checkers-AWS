/*var Lobby = new function(stars,room_name,turn){

    let tie_requests = []
    var players = []
    function addPlayer(id){
        if (players.size < 2 && !players[0] === id){
            return players.push(id)
        }
    }
    function removePlayer(id){
        if(players.length > 0){
            return players.splice(id,1)
        }
    }
    function isFree(){
        return players.length == 1
    }
    function hasPlayer(player){
        return players.find(p => p === player)
    }
    function getPlayers(index = -1){
        if(index>=0){
            return players[index]
        }else{
            return players
        }
    }
    function tieProposal(user_id){
        if(players.includes(user_id) && !tie_requests.includes(user_id)){
            tie_requests.push(user_id)
        }
    }
    function tie(){
        return tie_requests.length >= 2
    }
    return {
        stars,
        turn,
        room_name,
        isFree,
        addPlayer,
        removePlayer,
        hasPlayer,
        getPlayers,
        tieProposal,
        tie
    }
}*/
module.exports = class Lobby{

    constructor(stars,room_name,turn) {
        this.stars = stars;
        this.room_name = room_name
        this.turn = turn;
        this.tie_requests = []
        this.players = []
    }
    
     addPlayer(id){
        if (this.players.size < 2 && !this.players[0] === id){
            return this.players.push(id)
        }
    }
     removePlayer(id){
        if(this.players.length > 0){
            return this.players.splice(id,1)
        }
    }
    tieProposal(user_id){
        if(this.players.includes(user_id) && !this.tie_requests.includes(user_id)){
            this.tie_requests.push(user_id)
        }
    }
    hasPlayer(player){
        return this.players.find(p => p === player)
    }
    get isFree(){
        return this.players.length == 1
    }
    get players(index = -1){
        if(index>=0){
            return this.players[index]
        }else{
            return this.players
        }
    }

    get tied(){
        return this.tie_requests.length >= 2
    }
}