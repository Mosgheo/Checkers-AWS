const express = require("express")
const router = express.Router()
const controller = require("../controllers/userController")

router
	.get("/player/getProfile", controller.getProfile) // GET players
    .get('player/getHistory',controller.getHistory)
    .post("/player/updateProfile", controller.updateProfile) // Adds a player
module.exports = router