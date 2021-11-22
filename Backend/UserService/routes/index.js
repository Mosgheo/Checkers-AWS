const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")

router
    //Profile routes
	.get("/getLeaderboard",userController.getLeaderboard)
	.get("/profile/getProfile",userController.getProfile)
	.get("/profile/getHistory",userController.getHistory)
	.put("/profile/updateProfile",userController.updateProfile)
	.post("/login",userController.login)
	.post("/signup",userController.signup)
	.put("/authenticate",userController.verify_token)
module.exports = router