const express = require("express");
const customMiddleware = require("./customMiddleware.js");


const router = express.Router();







router.get("/withdraw", async(req, res)=>{
	try{
		const validAccount = await customMiddleware.getCookie(req, res);

		if(validAccount){
			const rate = await customMiddleware.rate_by_country(validAccount.country);
			res.render("withdraw.ejs", {data: validAccount, rate});
		}else{
			res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
			res.redirect("/login");
		};
	}catch(error){
		customMiddleware.logger(error);
	};
});





module.exports = router;