var Lobby = new function(stars,room_name,turn){

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
}