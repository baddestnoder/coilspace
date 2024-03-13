const express = require("express");
const expressQueue = require("express-queue");

const registerController = require("./registerController.js");

const router = express.Router();




const requestQueue = expressQueue({
	activeLimit: 1,
	queuedLimit: 10,
	rejectHandler: (req, res) =>{
		res.status(400).json({message: "Too many people on queue, please try again now."});
	}
});





router.get("/reg/:invite", registerController.getRegister);

router.post("/resend_otp", registerController.get_new_otp);
router.post("/verify_otp", registerController.verify_otp,)

router.post("/register", requestQueue, registerController.postRegister);






module.exports = router;