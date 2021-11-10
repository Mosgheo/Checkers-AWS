const express = require("express")
const router = express.Router()
const gameController = require("../controller/lobbyController")

router
    //Game routes
	//TODO
	//DONE
	.get("/game/history", gameController.gameHistory)
	.delete("/game/leaveGame", gameController.leaveGame)
	.put("/game/lobbies/create_game", gameController.create_game)
	.put("/game/tieGame", gameController.tieGame)
	.put("/game/movePiece", gameController.movePiece)
    
module.exports = router