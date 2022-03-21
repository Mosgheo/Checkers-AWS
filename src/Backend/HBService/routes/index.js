const express = require("express")
const router = express.Router()
const hbController = require("../controller/hbController")

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
	.post("/register",hbController.register)
	.put('/heartbeat',hbController.heartbeat)



module.exports = router