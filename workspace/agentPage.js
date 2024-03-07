const express = require("express");
const customMiddleware = require("./customMiddleware.js");
const UserDB = require("./register/registerSchema.js");
const CoilDB = require("./generateCoil/generateCoilSchema.js");

const router = express.Router();









router.get("/agentPage/:agent_id", async(req, res)=>{
	
	try{
		const validAccount = await customMiddleware.getCookie(req, res);

		if(validAccount){

			const rate = await customMiddleware.rate_by_country(validAccount.country);
			const sanitized = customMiddleware.sanitized(req.params.agent_id);

			if(sanitized){

				const thisAgent = await UserDB.findOneAndUpdate(
					{_id: req.params.agent_id},
					{$inc: {new_agent_point: -1}}
				);


				if(thisAgent){
					thisAgent.password = "";
					res.render("agentPage.ejs", {data: validAccount, thisAgent, rate});
				}else{
					res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
					res.redirect("/login");
				}
			}else{
				res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
				res.redirect("/login");
			}
		}else{
			res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
			res.redirect("/login");
		}
	}catch(error){
		customMiddleware.logger(error);
	};
});













router.post("/agentRate", async(req, res)=>{

	const startTime = Date.now();

	try{
		const incomomgDataValue = Object.values(req.body);
		const incomomgDataKey = Object.keys(req.body);

		let malicious = "none";

		incomomgDataValue.forEach((each, i)=>{
			if(customMiddleware.sanitized(each) === false){
				malicious = incomomgDataKey[i];
			}
		});
		
		

		if(malicious === "none"){

			const validAccount = await customMiddleware.getCookie(req, res);

			if(parseInt(req.body.rateCount) > 5){
				await UserDB.findOneAndUpdate({_id: validAccount._id},
					{$set: {rate_ban: true}}
				)
			}
			

			
			if(validAccount._id.toString() === req.body.agent_id || validAccount.rate_ban === true || parseInt(req.body.rateCount) > 0){
				res.json({message: "successful"});
			}else{


				await UserDB.findOneAndUpdate(
					{_id: req.body.agent_id},

					{
						$inc: {
				            rude_rate: req.body.rude,
				            unavailable_rate: req.body.unavailable,
				            crime_rate: req.body.scam
				        }
					},
					{new: true}
				);

				already_rated = true;
				res.json({message: "successful"});
			}
		}else{
			res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
			res.redirect("/login");
		}
	}catch(error){
		const error_second = (Date.now - startTime) / 1000;
		customMiddleware.catchError(error, res, error_second);
	}

});









module.exports = router;