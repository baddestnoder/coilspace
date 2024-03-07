const router = require("express").Router();
const customMiddleware = require("./customMiddleware.js");
const CoilDB = require("./generateCoil/generateCoilSchema.js");





router.get("/CoilCard/:coil_id", async(req, res)=>{

	try{

		const validAccount = await customMiddleware.getCookie(req, res);

		if(validAccount){
			const rate = await customMiddleware.rate_by_country(validAccount.country);
			const sanitized = customMiddleware.sanitized(req.params.coil_id);

			if(sanitized === true){
				const validCoil = await CoilDB.findOne({coil_id: req.params.coil_id});

				if(validCoil){
					res.render("CoilCard.ejs", {coil: validCoil, data: validAccount, rate});
				}else{

				}
			}else{
				res.status(401).redirect("/login");
			}
			
		}else{
			res.status(401).redirect("/login");
		}
	}catch(error){
		customMiddleware.logger(error);
	}
	
});













module.exports = router;