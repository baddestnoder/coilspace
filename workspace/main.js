const express = require("express");
const customMiddleware = require("./customMiddleware.js");
const InvestmentDB = require("./investment/investmentSchema.js");


const router = express.Router();





router.get("/main", async(req, res)=>{

	try{
		const validAccount = await customMiddleware.getCookie(req, res);

		if(validAccount){
			const rate = await customMiddleware.rate_by_country(validAccount.country);
			const myInvestment = await InvestmentDB.find({owner_id: validAccount._id.toString()});
			res.render("main.ejs", {data: validAccount, rate, myInvestment});
		}else{
			res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
			res.redirect("/login");
		};
	}catch(error){
		customMiddleware.logger(error);
	};
});




module.exports = router;