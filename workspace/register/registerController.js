const express = require("express");
const jwt = require("jsonwebtoken");
const UserData = require("./registerSchema.js");
const customMiddleware = require("../customMiddleware.js");
const HistoryDB = require("../history/historySchema.js");



const getRegister = async(req, res)=>{
	res.render("register.ejs", {inviter: req.params.invite});
};






const postRegister = async(req, res)=>{

	const startTime = Date.now();

	try{
		
		//converting incoming data value and keys to array
		const incomomgDataValue = Object.values(req.body);
		const incomomgDataKey = Object.keys(req.body);

		let malicious = "none";

		incomomgDataValue.forEach((each, i)=>{
			if(customMiddleware.sanitized(each) === false){
				malicious = incomomgDataKey[i];
			}
		});

		
		const number_of_account = await UserData.countDocuments();


		if(malicious === "none" || malicious === "date"){

			const incomomgData = {
				password: req.body.password,
				fName: req.body.fName,
				lName: req.body.lName,
				email: req.body.email,
				country: req.body.country,
				currency_format: req.body.currency_format,
				currency: req.body.currency,
				wallet_balance: 0,
				index: number_of_account+1,
				agent: false,
				crime_rate:0,
				unavailable_rate: 1,
				rude_rate:1,
				new_agent_point: 20,
				referral_commission: 0,
				number_of_referral: 0,
				rate_ban: false,
				account_ban: false
			};




			let inviter = null;

			if(!isNaN(parseInt(req.body.inviter))){

				inviter = await UserData.findOneAndUpdate(
					{index: parseInt(req.body.inviter)},
					{$inc: {number_of_referral: 1}}
				);

				if(inviter){
					incomomgData.invited_by = inviter._id.toString();
				}
			}



			const emailExist = await UserData.findOne({email: incomomgData.email});

			if(emailExist){
				res.status(401).json({error: {code: "EMAIL_ALREADY_EXIST", message: "This Email has already been registered with us"}});
			}else{

				if(inviter){
					await new HistoryDB({
						owner_id: inviter._id.toString(),
						type: "Referral",
						name: incomomgData.fName+" "+incomomgData.lName,
						date: req.body.date
					}).save();
				}

				
				const thisAccount = await new UserData(incomomgData).save();
				const signature = jwt.sign({id: thisAccount._id}, process.env.SECRET, {expiresIn: 60 * 60 * 24});
				res.cookie("signature", signature, {httpOnly: true, maxAge: 1000 * 60 * 60 * 24});
				res.status(200).json({message: "successful"});
			};
		}else{
			res.status(400).json({error: {malicious, message: "Your name has been rejected, please enter your real name"}});
		};
	
	}catch(error){
		const error_second = (Date.now - startTime) / 1000;
		customMiddleware.catchError(error, res, error_second);
	}
};









module.exports = {
	getRegister,
	postRegister
};