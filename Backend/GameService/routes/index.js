const express = require("express")
const router = express.Router()
const gameController = require("../controller/lobbyController")

router
    //Game routes
	//TODO
	.get("/game/history", gameController.gameHistory)
	.delete("/game/leaveGame", gameController.leaveGame)
	.put("/game/tieGame", gameController.tieGame)
	//DONE
	.put("/game/lobbies/create_game", gameController.create_game)
	.put("/game/movePiece", gameController.movePiece)
    
module.exports = router