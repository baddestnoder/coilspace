const router = require("express").Router();
const customMiddleware = require("./customMiddleware.js");
const HistoryDB = require("./history/historySchema.js");
const UserDB = require("./register/registerSchema.js");








router.get("/refer", async(req, res)=>{
	try{
		const validAccount = await customMiddleware.getCookie(req, res);

		if(validAccount){
			const rate = await customMiddleware.rate_by_country(validAccount.country);
			const history = await HistoryDB.find({type: {$in: ["Referral", "Referral Commission", "Commission Withdrawal"]}, owner_id: validAccount._id.toString()});

			res.render("refer.ejs", {data: validAccount, rate, history});
		}else{
			res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
			res.redirect("/login");
		};
	}catch(error){
		customMiddleware.logger(error);
	};
});







router.post("/withdraw_referral", async(req, res)=>{
	try{
		const validAccount = await customMiddleware.getCookie(req, res);

		if(validAccount){
			if(validAccount.referral_commission < 1){
				res.status(401).json({message: "You do not have any Referral Commission to withdraw."});
			}else{
				await UserDB.findOneAndUpdate(
					{_id: validAccount._id},
					{$inc: {
						referral_commission: -validAccount.referral_commission,
						wallet_balance: validAccount.referral_commission
					}}
				);

				await new HistoryDB({
					type: "Commission Withdrawal",
					amount: validAccount.referral_commission,
					owner_id: validAccount._id.toString(),
					date: req.body.date
				}).save();

				res.status(200).json({deducted: validAccount.referral_commission});
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