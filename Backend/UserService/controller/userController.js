const User = require('../models/userModel')

exports.getProfile = async function(req,res){
    let mail = req.query.mail
    try {
        let data = await User.find({mail:mail}).lean()
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
        let user = await User.findById({userID:req.body.user_idid})
        let data = []
        if(user === null){
            res.status(404).json({error: "Cannot find any player with such ID"})
        }
        data.push(user.wins)
        data.push(data.losses)
        res.status(200).json(data)
    }catch{
        res.status(500).json({error: "Error while retrieving player profile from DB"})
    }
}
//Not sure it'll work
exports.updateProfile = async function(req,res){
    let user_id = req.body.params[0]
    let nationality = req.body.params[1]
    let name = req.body.params[2]
    let surname = req.body.params[3]
    let username = req.body.params[4]
    let used_username = await User.find({username:username})
    if(used_username === null){
        if(new_user = await User.findOneAndUpdate({"userID": user_id},{ $set:{
            username : username,
            nationality : nationality,
            name : name,
            surname : surname
        }})){
            res.status(200).json(new_user)
        }else{
            res.status(400).send({message: "Something went wrong while updating a user, please try again"})
        }
    }else{
        res.status(500).json({error: "Username already in use"})
    }

}

exports.getLeaderboard = async function(_,res){
    let users = await User.find({}).sort('stars')
    if(users != null){
        res.status(200).json(users);
    }else{
        res.status(500).send({message: "There is no one in the leaderboard."})
    }
}

