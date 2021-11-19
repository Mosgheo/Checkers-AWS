const User = require('../models/userModel')
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const email_validator = require("email-validator");
var passwordValidator = require('password-validator');
const fs = require('fs');
const password_validator = new passwordValidator()
    .is().min(8)
    .is().max(100)
    .has().uppercase(2)
    .has().lowercase(2)
    .has().digits(2)
    .has().not().spaces()
    .has().symbols(1)

const jsecret_path = './jwt_secret';
const jwt_secret = load_jwt_secret()


function load_jwt_secret(){
    if(fs.existsSync(jsecret_path)){
        return fs.readFileSync(jsecret_path,"utf-8")
    }else{
        let new_secret = randomString(32)
        fs.writeFileSync(jsecret_path,new_secret)
        return new_secret
    }
}
function randomString(length){
    return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}
function  salt(psw,salt){
    const hash = crypto.createHmac('sha512',salt);
    hash.update(psw)
    return hash.digest('hex')
}
exports.signup = async function(req,res){
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password;
    
    if(!email_validator.validate(email)){
        res.status(400).send({ message: "Email not valid." }).end();
    }else if (!username || username.length < 3 || username.length > 15) {
		res.status(400).send({ message: "Username not valid." }).end();
	} else if (!password_validator.validate(password)) {
		res.status(400).send(password_validator.validate(password,{details:true})).end();
	} else {
        const user = await User.find({email:email})
        const salt = genRandomString(128);
        const hash_psw = saltPassword(password,salt)
        const new_user = null
        if(user === null){
             new_user = new User({ 
                username: username,
                email: email,
                password: hash_psw,
                salt: salt,
                stars: 0,
                nationality: "",
                wins: 0,
                losses: 0,
                avatar: "",
            })
            await new_user.save()
            if(new_user === null){
                res.status(500).send({message: "Something went wrong during sign up, please try again"})
            }else{
                res.status(200).send({message:"Sign up completed successfully."})
            }
        }
    }
}
exports.login = async function(req,res){
    const email = req.body.mail
    const password = req.body.password
    if(email.trim() === "" || password.trim() === ""){
        res.status(400).send({message: "Login parameters can't have empty values"})
    }else{
        const registered_user = await User.findOne({email:email})
        if(registered_user){
            const alleged_password = salt(password,registered_user.salt)
            if(alleged_password == registered_user.password){
                console.log(email+" just logged in")
                //Will those two lines work?
                const token = await jwt.sign({user:{email:registered_user.email,username:username}},jwt_secret,{expiresIn: '1 day'})
                res.status(200).json({
                    token: token, 
                    message :"Authentication successfull, welcome back "+registered_user.username+"!",
                    user:{
                        username:registered_user.username,
                        email:email,
                        stars:registered_user.stars,
                        avatar:registered_user.avatar
                    }})
            }else{
                console.log(email+" failed authentication")
                res.status(400).send({message:"Authentication failed, wrong email and/or password"})
            }
        }else{
            console.log(email +"failed authentication")
            res.status(400).send({message:"Authentication failed, wrong email and/or password"})
        }
    }
}
exports.refresh_token = async function (req,res){
    const mail = req.query
    const token_id = req.authData.user_id
    if(id === token_id){
        const user = await User.find({mail:mail})
        if(user){
            //Check this await
           const token = await jwt.sign({user:{_id: user._id,email:user.email}},jwt_secret,{expiresIn: '1 day'})
           if(token){
               res.status(200).json({token:token})
           }else{
               res.status(500).send({message:"Error while refreshing token"})
           }
        }else{
            res.status(400).send({message:"No such user"})
        }
    }else{
        res.status(400).send({message:"Wrong mail"})
    }
}
exports.verify_token = async function(req,res){
    const b_header = req.headers['authorization']
    if(typeof b_header !== 'undefined'){
        const bearer = b_header.split(' ')
        const b_token = bearer[1]
        req.token = b_token
        const token = await jwt.verify(req.token,jwt_secret)
        if(token){
            res.status(200).json({token:token,user:token.user})
        }else{
            res.status(400).send({message:"Token verification"})
        }
    }
}

exports.getProfile = async function(req,res){
    let mail = req.query.mail
    console.log(mail)
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
        let user = await User.find({email:req.query.email})
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
        if(new_user = await User.findOneAndUpdate({"userID": user_id},
        { $set:{
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

