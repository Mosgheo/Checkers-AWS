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
        let user = User.findById(req.params.id)
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

}