const User = require('../models/userModel')

exports.getProfile = async function(req,res){
    try{
        let data = User.findById(req.params.id)
        if(data === null){
            res.status(404).json({error: "Cannot find any player with such ID"})
        }
        res.json(data)
    }catch{
        res.status(500).json({error: "Error while retrieving player profile from DB"})
    }
}
exports.getHistory = async function(req,res){
    try{
        let user = User.findById({userID:req.params.id})
        let data = []
        if(user === null){
            res.status(404).json({error: "Cannot find any player with such ID"})
        }
        data.push("Wins",user.wins)
        data.push("Losses",data.losses)
    }catch{
        res.status(500).json({error: "Error while retrieving player profile from DB"})
    }
}
exports.updateProfile = async function(req,res){
    let user_id = req.params.userId
    let updated_user = req.body
    let new_user
    if(new_user = User.findOneAndUpdate({"userID": user_id},{ $set:{
        username: updated_user.username,
        nationality: updated_user.nationality,
    }})){
        res.status(200).json(new_user)
    }else{
        res.status(400).send({message: "Something went wrong while updating a user, please try again"})
    }
}

exports.getLeaderboard = async function(_,res){
    let users = User.find({}).sort('stars')
    if(users != null){
        res.status(200).json(users);
    }else{
        res.status(500).send({message: "There is no one in the leaderboard."})
    }
}

/*
TURN HANDLING 
   let players = [];
   let current_turn = 0;
   let timeOut;
   let _turn = 0;
   const MAX_WAITING = 5000;

   function next_turn(){
      _turn = current_turn++ % players.length;
      players[_turn].emit('your_turn');
      console.log("next turn triggered " , _turn);
      triggerTimeout();
   }

   function triggerTimeout(){
     timeOut = setTimeout(()=>{
       next_turn();
     },MAX_WAITING);
   }

   function resetTimeOut(){
      if(typeof timeOut === 'object'){
        console.log("timeout reset");
        clearTimeout(timeOut);
      }
   }

 io.on('connection', function(socket){
  console.log('A player connected');

  players.push(socket);
  socket.on('pass_turn',function(){
     if(players[_turn] == socket){
        resetTimeOut();
        next_turn();
     }
  })

  socket.on('disconnect', function(){
    console.log('A player disconnected');
    players.splice(players.indexOf(socket),1);
    _turn--;
    console.log("A number of players now ",players.length);
  });
});*/