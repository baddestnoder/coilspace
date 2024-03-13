const express = require("express");
const jwt = require("jsonwebtoken");
const UserData = require("./registerSchema.js");
const customMiddleware = require("../customMiddleware.js");
const HistoryDB = require("../history/historySchema.js");







const getRegister = async(req, res)=>{
	res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
	res.render("register.ejs", {inviter: req.params.invite});
};










const postRegister = async(req, res)=>{

	const startTime = Date.now();

	try{
		
		//converting incoming data value and keys to array
		const incomingDataValue = Object.values(req.body);
		const incomingDataKey = Object.keys(req.body);

		let malicious = "none";

		incomingDataValue.forEach((each, i)=>{
			if(customMiddleware.sanitized(each) === false){
				malicious = incomingDataKey[i];
			}
		});

		
		const number_of_account = await UserData.countDocuments();


		if(malicious === "none" || malicious === "date"){

			const otp = Math.floor(100000 + Math.random() * 900000);

			const incomingData = {
				password: req.body.password,
				fName: req.body.fName,
				lName: req.body.lName,
				email: req.body.email,
				country: req.body.country,
				currency_format: req.body.currency_format,
				currency: req.body.currency,
				wallet_balance: 0,
				index: number_of_account+1,
				otp,
				agent: false,
				sales: 0,
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
					incomingData.invited_by = inviter._id.toString();
				}
			}



			const foundAccount = await UserData.findOne({email: incomingData.email});

			if(foundAccount){

				if(foundAccount.otp === "none"){
					res.status(401).json({error: {code: "EMAIL_ALREADY_EXIST", message: "This Email has already been registered with us"}});
				}else{

					await customMiddleware.otp(req.body.email, otp);
					await UserData.findOneAndUpdate({_id: foundAccount._id}, {$set: {otp: otp}});

					const signature = jwt.sign({id: foundAccount._id}, process.env.SECRET, {expiresIn: 60 * 60 * 24});
					res.cookie("signature", signature, {httpOnly: true, maxAge: 1000 * 60 * 60 * 24});

					res.status(401).json({error: {code: "OTP_NEEDED", message: "This Email has already been registered with us"}});
				}
				
			}else{

				if(inviter){
					await new HistoryDB({
						owner_id: inviter._id.toString(),
						type: "Referral",
						name: incomingData.fName+" "+incomingData.lName,
						date: req.body.date
					}).save();
				}

				const thisAccount = await new UserData(incomingData).save();

				await customMiddleware.otp(req.body.email, otp);

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















const get_new_otp = async(req, res)=>{

	const startTime = Date.now();

	try{

		const foundAccount = await customMiddleware.getCookie(req, res);

		if(foundAccount){

			const otp = Math.floor(100000 + Math.random() * 900000);

			await UserData.findOneAndUpdate({_id: foundAccount._id}, {$set: {otp: otp}});
			
			await customMiddleware.otp(foundAccount.email, otp);

			res.json({message: "successful"});

		}else{
			res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
			res.status(401).json({message: "login needed"});
		}
	}catch(error){
		const error_second = (Date.now - startTime) / 1000;
		customMiddleware.catchError(error, res, error_second);
	}
}












const verify_otp = async(req, res)=>{

	const startTime = Date.now();
	try{
		const sanitized = customMiddleware.sanitized(req.body.otp);

		if(sanitized){

			const foundAccount = await customMiddleware.getCookie(req, res);

			if(foundAccount.otp === req.body.otp){
				await UserData.findOneAndUpdate({_id: foundAccount._id}, {$set: {otp: "none"}});
				res.json({message: "successful"});
			}else{
				res.status(401).json({message: "Invalid or expired OTP"});
			}
		}else{
			res.status(401).json({message: "Invalid or expired OTP"});
		}
	}catch(error){
		const error_second = (Date.now - startTime) / 1000;
		customMiddleware.catchError(error, res, error_second);
	}
}












module.exports = {
	get_new_otp,
	verify_otp,
	getRegister,
	postRegister
};