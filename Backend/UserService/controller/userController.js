const User = require('../../GameService/models/userModel')

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

