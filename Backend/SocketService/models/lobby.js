var Lobby = new function(stars,initial_turn){
    var players = []
    let maxStars = stars
    let tie_requests = []
    var turn = initial_turn;
    function addPlayer(id){
        if (players.size < 2){
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
        if(players.includes(user_id) && tie_requests.includes(user_id)){
            tie_requests.push(user_id)
        }
    }
    function tie(){
        return tie_requests.length >= 2
    }
    return {
        maxStars,
        addPlayer,
        removePlayer,
        isFree,
        getPlayers,
        hasPlayer,
        tieProposal,
        turn
    }
}