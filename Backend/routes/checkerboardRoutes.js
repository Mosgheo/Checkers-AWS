const express = require("express")
const router = express.Router()
const gameController = require("../controllers/lobbyController")
const userController = require("../controllers/userController")

router
	//Lobby routes
	.get("/game/createLobby",gameController.build_lobby)
	.delete("/game/:id/deleteLobby", gameController.delete_lobby)
	.get("/game/lobbies/:stars/getLobbies/", gameController.getLobbies)
	.put("/game/lobbies/:id/joinLobby", gameController.joinLobby)
	//Game routes
	.get("/game/:id/history", gameController.gameHistory)
	.delete("/game/:id/leaveGame", gameController.leaveGame)
	.put("/game/:id/tieGame", gameController.tieGame)
	.put("/game/:id/movePiece", gameController.movePiece)
	//Profile routes
	.get("/getLeaderboard",userController.getLeaderboard)
	.get("/profile/:id/getProfile",userController.getProfile)
	.get("/profile/:id/getHistory",userController.getHistory)
	.put("/profile/:id/updateProfile",userController.updateProfile)

module.exports = router