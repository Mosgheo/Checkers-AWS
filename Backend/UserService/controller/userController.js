const User = require('../models/userModel')
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const email_validator = require("email-validator");
var passwordValidator = require('password-validator');
const fs = require('fs');
/**
 *   refresh_token(succHandler, errorHandler) {
        var tokenData = JSON.parse(atob(localStorage.token.split('.')[1]));
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
                mail: email,
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
        const registered_user = await User.findOne({email:email})
        if(registered_user){
            const alleged_password = salt_function(password,registered_user.salt)
            if(alleged_password == registered_user.password){
                console.log(email+" just logged in")
                //Will those two lines work?
                const token = await jwt.sign({user:{email:registered_user.email,username:registered_user.username}},jwt_secret,{expiresIn: '1 day'})
                console.log("HELLO " + email)
                res.status(200).json({
                    token: token, 
                    message :"Authentication successfull, welcome back "+registered_user.username+"!",
                    user:{
                        username:registered_user.username,
                        email:email,
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
            res.status(400).send({message:"Token verification error"})
        }
    }
}

exports.getProfile = async function(req,res){
    //WILL THIS QUERY WORK?
    const mail = req.query.mail
    console.log(mail)
    try {
        const data = await User.find({mail:mail}).lean()
        if(data === null){
            res.status(404).json({error: "Cannot find any player with such ID"})
        }
        res.json({
            username: data.username,
            stars: data.stars,
            mail:data.mail
        })
    }catch{
        res.status(500).json({error: "Error while retrieving player profile from DB"})
    }
}
exports.getHistory = async function(req,res){
    try{
        const user = await User.find({email:req.query.email})
        const data = []
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
    console.log("SOMEONE UPDATED PROFILE YEA FUCK YEA")
    //NOT SURE ABOUT THEESE
    const user_mail = req.body.params[0]
    const name = req.body.params[1]
    const surname = req.body.params[2]
    const username = req.body.params[3]
    const mail = req.body.params[4]
    if(mail === user_mail){
        if(new_user = await User.findOneAndUpdate({"userID": user_mail},
        { $set:{
            username : username,
            name : name,
            surname : surname
        }})){
            res.status(200).json(new_user)
        }else{
            res.status(400).send({message: "Something went wrong while updating a user, please try again"})
        }
    }else{
        const email = await User.find({mail:mail})
        if(email === null){
            if(new_user = await User.findOneAndUpdate({"userID": user_mail},
            { $set:{
                username : username,
                name : name,
                surname : surname
            }})){
                res.status(200).json(new_user)
            }else{
                res.status(400).send({message: "Something went wrong while updating a user, please try again"})
            }
        }else{
            res.status(500).json({error: "Email already in use"})
        }
    }
}

exports.getLeaderboard = async function(_,res){
    const users = await User.find({}).sort('stars')
    if(users != null){
        res.status(200).json(users);
    }else{
        res.status(500).send({message: "There is no one in the leaderboard."})
    }
}
exports.updatePoints = async function(req,res){
    const user_id = req.body.user_id
    const stars = req.body.stars
    const updatedUser = await User.findOneAndUpdate({"user_id":user_id},{$inc: {stars:stars}})
    if(updatedUser){
        res.status(200).json(updatedUser)
    }else{
        res.status(500).send({message:"Something went wrong while updating your points"})
    }
}
