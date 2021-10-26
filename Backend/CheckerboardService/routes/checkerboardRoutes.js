const express = require("express")
const router = express.Router()
const controller = require("../controllers/controller")

router
	//.get("/game/newGame",controller.newGame)
	.get("/game/getBoard", controller.getBoard)
	//.delete("/game/deleteBoard", controller.deleteBoard)
	.put("/game/movePiece", controller.movePiece)

module.exports = router