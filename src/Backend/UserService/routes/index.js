const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")

router
	.all("*", function(req,res,next){
		const cert = req.socket.getPeerCertificate();
		if (req.client.authorized) {
			next()
		} else if (cert.subject) {
			res.status(403)
				 .send(`Sorry ${cert.subject.CN}, certificates from ${cert.issuer.CN} are not welcome here.`);
	
		} else {
			res.status(401)
			   .send(`Sorry, but you need to provide a valid certificate to continue.`);
		}
	})
    //Profile routes
	.get("/getLeaderboard",userController.getLeaderboard)
	.get("/authenticate",userController.verify_token)
	.get("/refresh_token",userController.refresh_token)
	.get("/profile/getProfile",userController.getProfile)
	.get("/profile/getHistory",userController.getHistory)

	.put("/profile/updateProfile",userController.updateProfile)
	.put("/profile/updatePoints",userController.updatePoints)

	.post("/login",userController.login)
	.post("/signup",userController.signup)



module.exports = router