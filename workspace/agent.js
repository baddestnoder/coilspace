const express = require("express");
const customMiddleware = require("./customMiddleware.js");
const UserDB = require("./register/registerSchema.js");
const CoilDB = require("./generateCoil/generateCoilSchema.js");

const router = express.Router();






router.get("/agent", async(req, res)=>{
	try{
		const validAccount = await customMiddleware.getCookie(req, res);

		if(validAccount){
			const rate = await customMiddleware.rate_by_country(validAccount.country);
			res.render("agent.ejs", {data: validAccount, rate});
		}else{
			res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
			res.redirect("/login");
		};
	}catch(error){
		customMiddleware.logger(error);
	};
});






















router.post("/agent", async(req, res)=>{

	const startTime = Date.now();

	try{

		if(req.body.whatsapp_link.includes("https://wa.me/message")){

			const validAccount = await customMiddleware.getCookie(req, res);
			const sanitized = customMiddleware.sanitized(req.body.whatsapp_number);

			if(validAccount && sanitized){

				const existed_whatsapp = await UserDB.findOne(
					{
						$or: [
							{whatsapp_link: req.body.whatsapp_link},
							{whatsapp_number: req.body.whatsapp_number}
						],
						_id: {$not: {$eq: validAccount._id}}
					}


				);

				if(existed_whatsapp){
					res.status(401).json({message: "Your WhatsApp details have already been used by another Agent."});
				}else{

					await UserDB.findOneAndUpdate(
						{_id: validAccount._id},
						{$set: {
							agent: true,
							whatsapp_link: req.body.whatsapp_link,
							whatsapp_number: req.body.whatsapp_number
						}},
						{new: true}
					);


					res.status(200).json({message: "successful"});
				}

			}else{
				res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
				res.status(401).json({message: "login needed"});
			}
		}else{
			res.status(401).json({message: "Invalid WhatsApp link"});
		}

	}catch(error){
		const error_second = (Date.now - startTime) / 1000;
		customMiddleware.catchError(error, res, error_second);
	}
});









module.exports = router;