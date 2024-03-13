const router = require("express").Router();
const customMiddleware = require("./customMiddleware");
const UserDB = require("./register/registerSchema.js");
const CoilDB = require("./generateCoil/generateCoilSchema.js")







const getBuyCoil = router.get("/buy_coil", async(req, res)=>{
	try{
		const validAccount = await customMiddleware.getCookie(req, res);

		if(validAccount){
			const rate = await customMiddleware.rate_by_country(validAccount.country);

			let agent = await UserDB.find({
				_id: {$ne: validAccount._id},
				agent: true,
				wallet_balance: {$gt: 10*rate},
				country: validAccount.country,
				crime_rate: 0,
				new_agent_point: {$gt: 0}
			}).sort({unavailable_rate: 1}).limit(50).sort({wallet_balance: -1}).limit(3);



			if(agent.length < 1){
				agent = await UserDB.find({
					_id: {$ne: validAccount._id},
					agent: true,
					wallet_balance: {$gt: 10*rate},
					crime_rate: 0,
					country: validAccount.country,
				}).sort({unavailable_rate: 1}).limit(50).sort({wallet_balance: -1}).limit(3);
			};


			if(agent.length === 0){
				const this_country_users = await UserDB.countDocuments({country: validAccount.country});
				const message = `But currently, we don't have any active agent in ${validAccount.country}, and there are ${this_country_users*100} people in ${validAccount.country} actively searching for Agents to purchase from This is a golden opportunity for you to become successful as a coil dealer in ${validAccount.country}`;

				res.render("buyCoil.ejs", {agent, message, data: validAccount, rate});
			}else{
				agent.forEach((each)=>{
					each.password = "";
				});

				res.render("buyCoil.ejs", {agent, data: validAccount, rate});
			};
		}else{
			res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
			res.redirect("/login");
		};
	}catch(error){
		customMiddleware.logger(error);
	};
});








module.exports = getBuyCoil;