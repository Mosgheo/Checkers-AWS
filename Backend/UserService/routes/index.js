const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")

router
    //Profile routes
	.get("/getLeaderboard",userController.getLeaderboard)
	
	.get("/profile/getProfile",userController.getProfile)
	.get("/profile/getHistory",userController.getHistory)
	.put("/profile/updateProfile",userController.updateProfile)
	.put("/profile/updatePoints",userController.updatePoints)

	.post("/login",userController.login)
	.post("/signup",userController.signup)

	.get("/authenticate",userController.verify_token)
	.get("/refresh_token",userController.refresh_token)

module.exports = router