const express = require("express");
const jwt = require("jsonwebtoken")
const AccountDB = require("./register/registerSchema.js");
const customMiddleware = require("./customMiddleware.js");



const router = express.Router();








router.get("/login", async(req, res)=>{
	res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
	res.render("login.ejs");
});











router.post("/login", async(req, res)=>{

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



		if(malicious = "none"){

			const incomomgData = {
				email: req.body.email,
				password: req.body.password
			};

			const email = incomomgData.email;
			const password = incomomgData.password;



			const login_response = await AccountDB.login(email, password);

			if(login_response === "Verification Failed"){
				const foundAccount = await AccountDB.findOne({email});
				if(foundAccount){
					res.status(401).json({message: "blocked"});
				}else{
					res.status(401).json({message: "This email is not registered with us... If you do not have an account yet, click Register"});
				}
			}else if(login_response._id){
				const signature = jwt.sign({id: login_response._id}, process.env.SECRET, {expiresIn: 60 * 60 * 24});
				res.cookie("signature", signature, {httpOnly: true, maxAge: 1000 * 60 * 60 * 24});
				res.status(200).json({message: "successful"});
			}else{
				res.status(500).json({message: "Unknown Error"});
			}
		}else{
			res.status(401).json({message: "blocked"});
		}

	}catch(error){
		const error_second = (Date.now - startTime) / 1000;
		customMiddleware.catchError(error, res, error_second);
	}

});







module.exports = router;