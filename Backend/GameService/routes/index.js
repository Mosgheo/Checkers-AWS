const express = require("express")
const router = express.Router()
const gameController = require("../controller/gameController")

router
    //Game routes
	.get("/game/history", gameController.gameHistory)
	.get("/games/userHistory",gameController.user_history)
	//.post("/game/deleteGame",gameController.deleteGame)
	.delete("/game/leaveGame", gameController.leaveGame)
	.post("/game/lobbies/create_game", gameController.create_game)
	.put("/game/tieGame", gameController.tieGame)
	.put("/game/movePiece", gameController.movePiece)
	.put("/game/turnChange",gameController.turnChange)

    
module.exports = router