const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")

router
    //Profile routes
	.get("/getLeaderboard",userController.getLeaderboard)
	.get("/profile/:id/getProfile",userController.getProfile)
	.get("/profile/:id/getHistory",userController.getHistory)
	.put("/profile/:id/updateProfile",userController.updateProfile)