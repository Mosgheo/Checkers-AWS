const user_service = require('../index')
const User = require('../models/userModel')

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
chai.should();

function new_OK_user(){
   return{
       first_name: "Tests",
       last_name: "User",
       mail: "userok@testusers.com",
       username: "filippo23",
       password: "1231AAcc*"
   }
}

function new_WRONG_user(){
   return{
       first_name: "Tests",
       last_name: "User",
       mail: "manuele.pasini@gmail",
       username: "filippo23",
       password: "12"
   }
}

async function register_user(user){
   return await chai.request(user_service)
   .post('/signup')
   .send(user)
}

async function login_user(user){
   return await chai.request(user_service)
   .post('/login')
   .send({mail: user.mail,password: user.password})
}
async function update_user_profile(mail,user){
    return await chai.request(user_service)
    .put('/profile/updateProfile')
    .send({mail:mail,params:user})
}
async function update_points(user){
    return await chai.request(user_service)
    .put("/profile/updatePoints")
    .send({mail:user.mail,stars:user.stars,won:user.won,tied:user.tied})
}
async function get_profile(user_mail){
    return await chai.request(user_service)
    .get("/profile/getProfile")
    .send({params:user_mail})
}
describe('Users', async () => {
   beforeEach(async() => {
       await User.deleteMany({mail:"userok@testusers.com"});
   });

   //TESTING POST REQUESTS
   describe('POST users',async () => {
    it('should register a new user', async() => {
        const new_user =  await register_user(new_OK_user())
         new_user.should.have.status(200)
     });
     it('should FAIL to register a new user', async() => {
         const new_user = await register_user(new_WRONG_user())
          new_user.should.have.status(400)
     });
     it('should login a user', async() => {
         const user = new_OK_user()
         const registered_user = await register_user(user)
         const logged_user = await login_user({mail:user.mail,password:user.password})
         registered_user.should.have.status(200)
         logged_user.should.have.status(200)
     });
     it('should FAIL to login a user', async() => {
         const logged_user =await login_user({mail:"ciao@ciao.ciao",password:"filippo23"})
          logged_user.should.have.status(400)
     });
   })
   //TESTING PUT REQUESTS
   describe('Testing PUT users',async () => {
    it('should update profile', async () => {
        let new_user = new_OK_user()
        await register_user(new_user)
        console.log("HELLO THERE" +new_user.mail)
        const new_values = {
            first_name:"Riccardo",
            last_name:"Fogli",
            mail: new_user.mail
        }
        const updated_user = await update_user_profile(new_user.mail,new_values)
        updated_user.should.have.status(200)
    })
    it('should FAIL to  update profile', async () => {
        let new_user = new_OK_user()
        await register_user(new_user)
        console.log("HELLO THERE" +new_user.mail)
        const new_values = {
            first_name:"Riccardo",
            last_name:"Fogli",
            mail: "new_mail@gmail.com"
        }
        const updated_user = await update_user_profile(new_user.mail,new_values)
        //can't update mail
        updated_user.should.have.status(400)
    })

    it('should update points',async() =>{
        let new_user = new_OK_user()
        await register_user(new_user)
        const updated_points = await update_points({
            mail:new_user.mail,
            stars:100,
            won:true,
            tied:false
        })
        //console.log("data "+updated_points.data)
        updated_points.should.have.status(200)
    })
    it('should FAIL update points',async() =>{
        let new_user = new_OK_user()
        await register_user(new_user)
        const updated_points = await update_points({
            mail:"CAio@caio.caio",
            stars:100,
            won:true,
            tied:false
        })
        //console.log("data "+updated_points.data)
        updated_points.should.have.status(400)
    })
    })
    //TESTING GET REQUESTS
    describe('Testing GET users',async () => {
        it('should get a profile',async ()=>{
            let new_user = new_OK_user()
            await register_user(new_user)
            const profile = await get_profile(new_user.mail)
            profile.should.have.status(200)
        })
        it('should FAIL to get a profile',async()=>{
            const profile = await get_profile("fake_user@gmail.com")
            profile.should.have.status(400)
        })
        it('should get a profile',async ()=>{
            let new_user = new_OK_user()
            await register_user(new_user)
            const profile = await get_profile(new_user.mail)
            profile.should.have.status(200)
        })
        it('should FAIL to get a profile',async()=>{
            const profile = await get_profile("fake_user@gmail.com")
            profile.should.have.status(400)
            profile.body.message.should.eql("Cannot find any player with such ID")
        })
    })
})
