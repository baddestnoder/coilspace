const router = require("express").Router();
const HistoryDB = require("./historySchema.js");
const customMiddleware = require("../customMiddleware");









router.get("/history", async(req, res)=>{

	try{
		const validAccount = await customMiddleware.getCookie(req, res);

		if(validAccount){

			const rate = await customMiddleware.rate_by_country(validAccount.country);

			const historyData = await HistoryDB.find({owner_id: validAccount._id.toString()});

			res.render("history.ejs", {data: validAccount, rate, historyData});
		}else{
			res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
			res.redirect("/login");
		};
	}catch(error){
		customMiddleware.logger(error);
	};
});











module.exports = router;