const router = require("express").Router();
const customMiddleware = require("./customMiddleware.js");
const InvestmentDB = require("./investment/investmentSchema.js");







router.get("/coil/:coil_id", async(req, res)=>{
	try{
		const validAccount = await customMiddleware.getCookie(req, res);

		if(validAccount){

			const sanitized = customMiddleware.sanitized(req.params.coil_id);

			if(sanitized){
				const isMyCoil = await InvestmentDB.findOne({coil_id: req.params.coil_id, owner_id: validAccount._id.toString()});

				if(isMyCoil){
					const rate = await customMiddleware.rate_by_country(validAccount.country);
					res.render("coil.ejs", {data: validAccount, rate, isMyCoil});
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
		};
	}catch(error){
		customMiddleware.logger(error);
	};
});








module.exports = router;