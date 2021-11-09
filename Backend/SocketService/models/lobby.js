var Lobby = new function(stars){
    var players = []
    let maxStars = stars
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
    return {
        maxStars,
        addPlayer,
        removePlayer,
        isFree,
        getPlayers,
        hasPlayer
    }
}