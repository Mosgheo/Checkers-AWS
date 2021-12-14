const User = require('../models/userModel')
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const email_validator = require("email-validator");
let passwordValidator = require('password-validator');
const fs = require('fs');
/**
 *   refresh_token(succHandler, errorHandler) {
        let tokenData = JSON.parse(atob(localStorage.token.split('.')[1]));
        const authHeader = 'bearer '.concat(localStorage.token);
        axiosInstance.get("/users/" + tokenData.user._id + "/token", { headers: { Authorization: authHeader } })
            .then(response => {
                if (succHandler) {
                    succHandler(response.data.token);
                }
            })
            .catch(error => api.handleError(error, errorHandler));
    },

    TOKEN REFRESHING ON FRONTEND, API.JS
 */
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
function salt_function(psw,salt){
    const hash = crypto.createHmac('sha512',salt);
    hash.update(psw)
    return hash.digest('hex')
}
exports.signup = async function(req,res){
    console.log("someone is signing up")
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    console.log(email)
    if(!email_validator.validate(email)){
        console.log("email not valid")
        res.status(400).send({ message: "Email not valid." }).end();
    }else if (!username || username.length < 3 || username.length > 15) {
        console.log("username not valid")
		res.status(400).send({ message: "Username not valid." }).end();
	} else if (!password_validator.validate(password)) {
        console.log("psw not valid")
		res.status(400).send(password_validator.validate(password,{details:true})).end();
	} else {
        console.log("Trying to find user")
        const user = await User.findOne({mail:email}).lean()
        const salt = randomString(128);
        const hash_psw = salt_function(password,salt)
        let new_user = null
        if(user === null){
            console.log("Signign up a new user")
             new_user = new User({ 
                username: username,
                stars: 0,
                first_name: first_name,
                last_name: last_name,
                wins: 0,
                losses: 0,
                avatar: "",
                mail: email,
                password: hash_psw,
                salt: salt,
                nationality: "",
            })
            await new_user.save()
            if(new_user === null){
                res.status(500).send({message: "Something went wrong during sign up, please try again"})
            }else{
                res.status(200).send({message:"Sign up completed successfully."})
            }
        }else{
            res.status(400).send({message:"An existing account has already been associated with this email."})
        }
    }
}
exports.login = async function(req,res){
    const email = req.body.mail
    const password = req.body.password
    console.log(password)
    if(email.trim() === "" || password.trim() === ""){
        res.status(400).send({message: "Login parameters can't have empty values"})
    }else{
        const registered_user = await User.findOne({mail:email})
        if(registered_user){
            const alleged_password = salt_function(password,registered_user.salt)
            if(alleged_password == registered_user.password){
                console.log(email+" just logged in")
                //Will those two lines work?
                const token = await jwt.sign({user:{email:registered_user.mail,username:registered_user.username}},jwt_secret,{expiresIn: '1 day'})
                res.status(200).json({
                    token: token, 
                    message :"Authentication successfull, welcome back "+registered_user.username+"!",
                    user:{
                        username:registered_user.username,
                        first_name: registered_user.first_name,
                        last_name: registered_user.last_name,
                        mail:email,
                        stars:registered_user.stars,
                        nationality:registered_user.nationality,
                        wins:registered_user.wins,
                        losses:registered_user.losses,
                        avatar:registered_user.avatar
                }})
            }else{
                console.log(email+" failed authentication")
                res.status(400).send({message:"Authentication failed, wrong email and/or password"})
            }
        }else{
            console.log(email +"this email is not registered")
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
    console.log("veryfing token")
    const b_header = req.headers['authorization']
    try{
        if(typeof b_header !== 'undefined'){
            const bearer = b_header.split(' ')
            const b_token = bearer[1]
            req.token = b_token
            const token = await jwt.verify(req.token,jwt_secret)
            if(token){
                console.log("token ok")
                res.status(200).json({token:token,user:token.user})
            }else{
                console.log("token error")
                res.status(400).send({message:"Token verification error"})
            }
        }
    }catch(err){
        console.log("Someone is trying to do some nasty illegal things")
        res.status(400).send({message:"User not authenticated"})
    }

}

exports.getProfile = async function(req,res){
    //WILL THIS QUERY WORK?
    const mail = req.query.mail
    console.log("I'm in get profile " +mail)
    try {
        const data = await User.findOne({mail:mail}).lean()
        if(data === null){
            res.status(404).json({error: "Cannot find any player with such ID"})
        }else{
            console.log("profile sent")
            res.json({
                username: data.username,
                first_name: data.first_name,
                last_name: data.last_name,
                stars: data.stars,
                mail:data.mail
            })
        }
    }catch{
        res.status(500).json({error: "Error while retrieving player profile from DB"})
    }
}
exports.getHistory = async function(req,res){
    try{
        console.log("hello welcome to history gegtter "+req.query.mail)
        const user = await User.find({mail:req.query.mail})
        const data = []
        if(user === null){
            console.log("user null")
            res.status(404).json({error: "Cannot find any player with such ID"})
        }
        console.log("hello someone requested this wins:" +user.wins+" losse: "+user.losses)
        data.push(user.wins)
        data.push(user.losses)
        res.status(200).json(data)
    }catch{
        res.status(500).json({error: "Error while retrieving player profile from DB"})
    }
}

exports.updateProfile = async function(req,res){
    //NOT SURE ABOUT THEESE
    const user_mail = req.body.mail
    const name = req.body.params.first_name
    const surname = req.body.params.last_name
    const username = req.body.params.username
    const mail = req.body.params.mail
    console.log("usermail "+user_mail)
    console.log("mail to update:"+mail)
    if(mail === user_mail){
        console.log("Updating but not mail")
        try{
            new_user = await User.findOneAndUpdate({"mail": user_mail},
        { $set:{
            username : username,
            first_name : name,
            last_name : surname
        }})
        console.log("HELLO" + new_user)
            res.status(200).json({
                username: new_user.username,
                first_name: new_user.first_name,
                last_name: new_user.last_name,
                mail: new_user.mail,
                stars:new_user.stars
            })
        }catch(err){
            console.log(err)
            res.status(400).send({message: "Something went wrong while updating a user, please try again"})
        }
    }else{
        console.log("Updating even mail")
        const email = await User.find({mail:user_mail})
        if(email === null){
            if(new_user = await User.findOneAndUpdate({"mail": user_mail},
            { $set:{
                username : username,
                first_name : name,
                last_surname : surname
            }})){
                res.status(200).json({
                    username: new_user.username,
                    first_name: new_user.first_name,
                    last_name: new_user.last_name,
                    mail: new_user.mail,
                    stars:new_user.stars
                })
            }else{
                res.status(400).send({message: "Something went wrong while updating a user, please try again"})
            }
        }else{
            res.status(500).json({error: "Email already in use"})
        }
    }
}
//WILL THIS WORK?
exports.getLeaderboard = async function(_,res){
    try{
        const users = await User.find({},'username first_name last_name stars wins losses').sort({ stars: 'desc'})
        if(users != null){
            console.log(users)
            res.status(200).json(users);
        }else{
            res.status(200).send({message: "There is no one in the leaderboard."})
        }
    }catch(err){
        console.log(err)
        res.status(500).send({message: "Something went wrong."})
    }

}
exports.updatePoints = async function(req,res){
    const mail = req.body.mail
    const stars = req.body.stars
    console.log(stars)
    try{
        const user = await User.findOneAndUpdate({"mail":mail},{$inc: {stars:stars}})
        console.log("user updated")
        res.status(200).json({
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            mail: user.mail,
            stars:user.stars
        })
    }catch(err){
        console.log(err)
        res.status(500).send({message:"Something went wrong while updating your points"})
    }
}
