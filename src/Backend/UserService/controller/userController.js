const User = require('../models/userModel')
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const email_validator = require("email-validator");
let passwordValidator = require('password-validator');
const https = require("https")
const path = require('path');
const fs = require('fs');
const { default: axios } = require('axios');
const _ = require('lodash');

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

/**
 * 
 * @param err  error to be examined
 * @returns true if err is some form of HTTP error, false otherwise
 */
 function request_error(err){
    return 'response' in err &&
            err.response != undefined &&
             'status' in err.response
             && err.response.status != undefined
  }
const user_agent = new https.Agent({
    cert: fs.readFileSync(path.resolve(__dirname, ".."+path.sep+"cert"+path.sep+"user_cert.pem")),
    key: fs.readFileSync(path.resolve(__dirname, ".."+path.sep+"cert"+path.sep+"user_key.pem")),
    rejectUnauthorized: false
  })
    register_and_initialize_backup()
    /**
     * @TODO FILL THIS METHOD
     *  SET INITIAL SERVICE STATE BASED ON SOME BACKUP SENT BY HBController
     *  */ 
    function restore_backup(backup){
      // TODO
    }
    /**
     * @TODO FILL THIS METHOD
     * BUILD A BACKUP OF THIS SERVICE TO BE SENT TO HBController
     */
    function build_backup(){
      return ""
    }
   /**
     * Function used to make request to other services
     * 
     * @param {*} method HTTP method to use
     * @param {*} url service's url
     * @param {*} params request's params 
     * @returns  { status:
    *             response_status:
    *             response_data:
    *          }
    */
 async function ask_service(method,url,params){
   let response = ""
   const default_error_msg = {
     status:false,
     response_status:"405",
     response_data:"Wrong HTTPS method call"
   }
   try{
     switch(method){
       case "get":
         response = await axios.get(url, {params: params,httpsAgent:user_agent},{httpsAgent:user_agent})
         break
       case "post":
         response = await axios.post(url,params,{httpsAgent:user_agent})
         break
       case "put":
         response = await axios.put(url,params,{httpsAgent:user_agent})
         break
       case "delete":
         response = await axios.delete(url,{data:params},{httpsAgent:user_agentv})
         break
       default:
         return default_error_msg
     }
     return {
       status:true,
       response:response.data
     }
   }catch(err){
     console.log(err)
     return request_error(err) ? {status:false, response_status:err.response.status, response_data : err.response.data} : default_error_msg
   }
 }
    async function set_heartbeat_timer(){
      setTimeout(async ()=>{
        log("Sending heartbeat..")
        const hb_response = await ask_service("put",process.env.HB_SERVICE+"/heartbeat",{service_name: process.env.NAME,backup:build_backup()})
        if(hb_response.status){
          console.log("Heartbeat_response: "+ JSON.stringify(hb_response))
          set_heartbeat_timer()
        }else{
          log("failed to send heartbeat")
        }
      },process.env.HB_TIMEOUT)
    }

    async function register_and_initialize_backup(){
      const response = await ask_service("post",process.env.HB_SERVICE+"/register",{service_name:process.env.NAME})
      console.log(JSON.stringify(response))
      if(response.status){
        if(response.response.backup != ""){
          restore_backup()
        }
        set_heartbeat_timer()
      }else{
        setTimeout(async()=>{
          register_and_initialize_backup()
        },process.env.REGISTER_RETRY_TIMEOUT)
      }
    }
function log(msg){
    if(process.env.DEBUG){
        console.log(msg)
    }
}

//Loads the secret string  with which the server will authenticate clients
function load_jwt_secret(){
    if(fs.existsSync(jsecret_path)){
        return fs.readFileSync(jsecret_path,"utf-8")
    }else{
        let new_secret = randomString(32)
        fs.writeFileSync(jsecret_path,new_secret)
        return new_secret
    }
}
/**
 * Generats a random string of given length
 */
function randomString(length){
    return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}
/**
 * 
 * @param {*} psw  to be salted
 * @param {*} salt to apply to psw
 * @returns  salted psw
 */
function salt_function(psw,salt){
    const hash = crypto.createHmac('sha512',salt);
    hash.update(psw)
    return hash.digest('hex')
}

/**
 * Tries to sign up a new user
 */
exports.signup = async function(req,res){
	const username = req.body.username;
	const email = req.body.mail;
	const password = req.body.password;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    log(email+" is trying to sign up")
    log(email)
    if(!email_validator.validate(email)){
        log(email +" not valid")
        res.status(400).send({ message: "Email not valid." }).end();
    }else if (!username || username.length < 3 || username.length > 15) {
        log(username+" not valid")
		res.status(400).send({ message: "Username not valid." }).end();
	} else if (!password_validator.validate(password)) {
        log("Password for user "+email+ " not valid")
		res.status(400).send(password_validator.validate(password,{details:true})).end();
	} else {
        log("Checking if "+email+" already exists")
        const user = await User.findOne({mail:email}).lean()
        const salt = randomString(128);
        const hash_psw = salt_function(password,salt)
        let new_user = null
        if(user === null){
            log("Signign up a new user with mail "+email)
             new_user = new User({ 
                username: username,
                stars: 0,
                first_name: first_name,
                last_name: last_name,
                wins: 0,
                losses: 0,
                ties:0,
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
            log("Sadly someone else is already registered with "+email)
            res.status(400).send({message:"An existing account has already been associated with this email."})
        }
    }
}

//Tries to login a user
exports.login = async function(req,res){
    console.log(req)
    const email = req.body.mail
    const password = req.body.password
    log(email+ "is trying to login")
    if(email.trim() === "" || password.trim() === ""){
        res.status(400).send({message: "Login parameters can't have empty values"})
    }else{
        const registered_user = await User.findOne({mail:email},'username first_name last_name mail salt password stars nationality wins losses avatar')
        if(registered_user){
            const alleged_password = salt_function(password,registered_user.salt)
            if(alleged_password == registered_user.password){
                log(email+" just logged in successfully")
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
                        wins:registered_user.wins,
                        losses:registered_user.losses,
                        avatar:registered_user.avatar
                }})
            }else{
                log(email+" just failed authentication")
                res.status(400).send({message:"Authentication failed, wrong email and/or password"})
            }
        }else{
            log(email +" is not registered so he cannot authenticate")
            res.status(400).send({message:"Authentication failed, wrong email and/or password"})
        }
    }
}
exports.refresh_token = async function (req,res){
    const mail = req.query.mail
    const token = req.query.token
    var token_mail = JSON.parse(Buffer.from(token.split('.')[1], 'base64')).user.email;
    if(mail === token_mail){
        const registered_user = await User.findOne({mail:mail},'username first_name last_name mail stars nationality wins losses avatar')
        if(registered_user){
            //Check this await
           const token = await jwt.sign({user:{email:registered_user.mail,username:registered_user.username}},jwt_secret,{expiresIn: '1 day'})
           if(token){
               res.status(200).json({
                    token: token, 
                    user:{
                        username: registered_user.username,
                        first_name: registered_user.first_name,
                        last_name: registered_user.last_name,
                        mail: registered_user.mail,
                        stars: registered_user.stars,
                        wins: registered_user.wins,
                        losses: registered_user.losses,
                        avatar: registered_user.avatar
                    }
                })
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
    try{
        if(typeof b_header !== 'undefined'){
            const bearer = b_header.split(' ')
            const b_token = bearer[1]
            req.token = b_token
            const token = await jwt.verify(req.token,jwt_secret)
            log("veryfing token for "+token.user.email)
            if(token){
                log("token ok for user "+token.user.email)
                res.status(200).json({token:token,user:token.user})
            }else{
                log("token error for user "+token.user.email)
                res.status(400).send({message:"Token verification error, please log-in again."})
            }
        }
    }catch(err){
        log("Someone is trying to do some nasty illegal things")
        res.status(400).send({message:"User not authenticated, please log-in again."})
    }

}

exports.getProfile = async function(req,res){
    //WILL THIS QUERY WORK?
    const mail = req.query.mail
    log("Getting " +mail+ " profile")
    try {
        const data = await User.findOne({mail:mail},'username avatar first_name last_name stars mail').lean()
        if(data === null){
            log("Didn't found any profile associated to "+mail)
            res.status(400).json({error: "Cannot find any player with such ID"})
        }else{
            log("Found profile associated to "+mail+", sending it back")
            res.json({
                username: data.username,
                avatar: data.avatar == "" ? "https://picsum.photos/id/1005/400/250" : data.avatar ,
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
        const user_mail = req.query.mail
        const user = await User.find({mail:user_mail},'wins losses')
        const data = []
        log("Getting history for user "+user_mail)
        if(user === null){
            log("lol there's no such user as "+user_mail)
            res.status(400).json({error: "Cannot find any player with such ID"})
        }
        log("Successfully got history for "+user_mail)
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
    const mail = req.body.params.mail
    if(mail == user_mail){
        log("Updating "+user_mail+" profile")
        try{
            let new_values = {
                first_name : req.body.params.first_name,
                last_name : req.body.params.last_name,
                username : req.body.params.username,
                avatar: req.body.params.avatar
            }
            new_values = _.pickBy(new_values, _.identity);
            new_user = await User.findOneAndUpdate({"mail": user_mail},
        { $set:new_values})
        log("Successfully updated profile for "+user_mail)
            res.status(200).json({
                username: new_user.username,
                first_name: new_user.first_name, 
                last_name: new_user.last_name,
                mail: new_user.mail,
                stars:new_user.stars,
                avatar:new_user.avatar
            })
        }catch(err){
            log("Something went wrong while updating "+user_mail+" profile")
            log(err)
            res.status(400).send({message: "Something went wrong while updating a user, please try again"})
        }
    }else{
            res.status(400).json({message: "You can't change the email associated to an account."})
    }
}
//WILL THIS WORK?
exports.getLeaderboard = async function(_,res){
    try{
        const users = await User.find({},'username avatar stars wins losses ties').sort({ stars: 'desc'})
        if(users != null){ 
            users.map(user =>{
                user.avatar = user.avatar == "" ? "https://picsum.photos/id/1005/400/250" : user.avatar
            })
            log("Retrieving and sending leaderboard")
            res.status(200).json(users);
        }else{
            res.status(200).send({message: "There is no one in the leaderboard."})
        }
    }catch(err){
        log("Something went wrong while retrieving leaderboard"+"\n"+err)
        res.status(500).send({message: "Something went wrong."})
    }

}
exports.updatePoints = async function(req,res){
    const mail = req.body.mail
    const stars = req.body.stars
    const won = req.body.won
    const single_match = 1
    const tied = req.body.tied
    const user_stars = await User.findOne({"mail":mail})
    let user = null
    try{
        if(tied){
            user = await User.findOneAndUpdate({"mail":mail},{$inc: {ties:single_match,stars:stars}})
        }else{
            if(won){
                user = await User.findOneAndUpdate({"mail":mail},{$inc: {wins:single_match,stars:stars}})
           }else{
               if(user_stars.stars-Math.abs(parseInt(stars)) < 0){
                user = await User.findOneAndUpdate({"mail":mail},{$inc: {ties:single_match,stars:-user_stars.stars}})
               }else{
                user = await User.findOneAndUpdate({"mail":mail},{$inc: {stars:stars,losses:single_match}})
               }
           }
        }
        if(user != null){
            log("Just updated points for "+mail)
            res.status(200).json({
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                mail: user.mail,
                wins:user.wins,
                losses:user.losses,
                stars:user.stars
            })
        }else{
            log("Couldn't update points for "+mail)
            res.status(400).send({message:"We weren't able to update points for such user"})
        }
    }catch(err){
        log("Something went wrong while updating points for "+mail)
        log(err)
        res.status(500).send({message:"Something went wrong while updating your points"})
    }
}
