const router = require("express").Router();
const customMiddleware = require("./customMiddleware.js");
const CoilDB = require("./generateCoil/generateCoilSchema.js");
const UserDB = require("./register/registerSchema.js");





router.get("/CoilCard/:coil_id", async(req, res)=>{
	try{
		const validAccount = await customMiddleware.getCookie(req, res);

		if(validAccount){
			const rate = await customMiddleware.rate_by_country(validAccount.country);
			const sanitized = customMiddleware.sanitized(req.params.coil_id);

			if(sanitized){
				const validCoil = await CoilDB.findOne({coil_id: req.params.coil_id});

				if(validCoil){

					let buyer_whatsapp = await UserDB.find({
						agent: true,
						country: validAccount.country,
						crime_rate: 0,
						_id: {$ne: validAccount._id}
					}).sort({sales: -1}).limit(10).sort({unavailable: 1}).limit(5).sort({wallet_balance: 1}).limit(1);


					if(buyer_whatsapp.length === 1){
						buyer_whatsapp = buyer_whatsapp[0].whatsapp_link;
						res.render("CoilCard.ejs", {coil: validCoil, data: validAccount, rate, buyer_whatsapp});
					}else{
						res.render("CoilCard.ejs", {coil: validCoil, data: validAccount, rate, buyer_whatsapp: null});
					}
					
				}else{
					res.status(401).redirect("/history");
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