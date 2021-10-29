const express = require("express")
const router = express.Router()
const gameController = require("../controllers/lobbyController")

router
	.get("/game/createLobby",gameController.build_lobby)
	.get("/game/getBoard", gameController.getBoard)
	.get("/game/history", gameController.gameHistory)
	.delete("/game/deleteBoard", gameController.deleteBoard)
	.put("/game/movePiece", gameController.movePiece)

module.exports = router