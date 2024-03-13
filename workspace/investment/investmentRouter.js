const express = require("express");
const expressQueue = require("express-queue");

const investmentController = require("./investmentController.js");



const router = express.Router();



const requestQueue = expressQueue({
	activeLimit: 1,
	queuedLimit: 10,
	rejectHandler: (req, res) =>{
		res.status(400).json({message: "Your request was suspended due to high traffic, please try again now."});
	}
});



router.get("/investment", investmentController.get_investment);


router.post("/investment/:type", requestQueue, investmentController.post_investment);










module.exports = router;