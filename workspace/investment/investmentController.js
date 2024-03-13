const jwt = require("jsonwebtoken");

const customMiddleware = require("../customMiddleware.js");
const UserDB = require("../register/registerSchema.js");
const InvestmentDB = require("./investmentSchema.js");
const GenerateDB = require ("../generateCoil/generateCoilSchema.js");
const HistoryDB = require("../history/historySchema.js");





const get_investment = async(req, res)=>{
	try{
		const validAccount = await customMiddleware.getCookie(req, res);

		if(validAccount){
			const rate = await customMiddleware.rate_by_country(validAccount.country);
			res.render("investment.ejs", {data: validAccount, rate});
		}else{
			res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
			res.redirect("/login");
		};
	}catch(error){
		customMiddleware.logger(error);
	};
}













const post_investment = async(req, res)=>{

	const startTime = Date.now();

	try{

		const validAccount = await customMiddleware.getCookie(req, res);
		const pass = customMiddleware.sanitized(req.body.coil_id);


		if(validAccount){
			const rate = await customMiddleware.rate_by_country(validAccount.country);

			if(pass){
				const validCoil = await GenerateDB.findOne({coil_id: req.body.coil_id});

				if(validCoil){

					if(req.params.type === "deposit"){

						if(validCoil.used === true){
							if(validCoil.used_by === validAccount._id.toString()){
								res.status(401).json({message: "This coil has already been used by you."});
							}else{
								res.status(401).json({message: "This coil has already been used by another user."});
							}
						}else{

							const unit = parseFloat(req.body.coil_id.split("-")[1]);
							const last_investment = await InvestmentDB.findOne().sort({_id: -1});

							let removed_percentage = unit - unit/100*17;

							if(validAccount.invited_by){
								removed_percentage = unit - unit/100*20;
							}


							let incomingData = {
								invested_amount: unit*rate,
								coil_id: req.body.coil_id,
								owner_id: validAccount._id.toString(),
								unit,
								date: req.body.date,
								toShare: 0,
								shareable: false,
								total_DB_unit: unit,
								totalInvestment: await InvestmentDB.countDocuments() + 1,
								value: 0
							}


							//update used
							await GenerateDB.findOneAndUpdate(
								{coil_id: req.body.coil_id},
								{$set: {used: true, used_by: validAccount._id.toString()}},
								{new: true}
							);


							if(incomingData.coil_id.includes("agent")){

								const notNew_toAgent = await GenerateDB.findOne(
									{
										owner_id: validCoil.owner_id,
										coil_id: {$ne: incomingData.coil_id},
										used_by: validAccount._id.toString()
									}
								);


								if(notNew_toAgent){
									// Do nothing
								}else{
									await UserDB.findOneAndUpdate({_id: validCoil.owner_id},
										{$inc: {sales: 1}}
									)
								}
							}

							
							if(last_investment){
								incomingData.shareable = true;
								incomingData.toShare = removed_percentage / last_investment.total_DB_unit;
								incomingData.total_DB_unit = last_investment.total_DB_unit + incomingData.total_DB_unit;
							}


							const savedItem = await new InvestmentDB(incomingData).save();


							if(validAccount.invited_by){

								const inviter = await UserDB.findOne({_id: validAccount.invited_by});

								await new HistoryDB({
									type: "Referral Commission",
									amount: unit/100*3*await customMiddleware.rate_by_country(inviter.country), 
									owner_id: inviter._id.toString(),
									date: req.body.date,
									item_id: savedItem._id.toString()
								}).save();

								await UserDB.findOneAndUpdate({_id: inviter._id},
									{$inc: {referral_commission: unit/100*3*await customMiddleware.rate_by_country(inviter.country)}}
								);

							}

							await new HistoryDB({
								type: "Investment",
								amount: incomingData.unit,
								owner_id: validAccount._id.toString(),
								date: req.body.date,
								coil_id: req.body.coil_id,
								item_id: savedItem._id.toString()
							}).save();


							//We update paid after wallet is credited, to be sure that network did not fail... If paid is still false and a customer complains of his wallet not funded, we do it manually.
							await GenerateDB.findOneAndUpdate(
								{coil_id: req.body.coil_id},
								{$set: {paid: true}},
								{new: true}
							);


							res.status(200).json({message: "successful", coil_id: validCoil.coil_id});
						}
					}else{
						const invested_coil = await InvestmentDB.findOne({coil_id: validCoil.coil_id});

						if(invested_coil){
							const sanitized_password = customMiddleware.sanitized(req.body.password);
							if(sanitized_password){

								const login_response = await UserDB.login(validAccount.email, req.body.password);

								if(login_response === "Verification Failed"){
									res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
									res.status(401).json({message: "login needed"});
								}else{
									const cashout_amount = invested_coil.value * invested_coil.unit * rate;

									await InvestmentDB.findOneAndDelete({coil_id: validCoil.coil_id});

									await UserDB.findOneAndUpdate(
										{_id: invested_coil.owner_id},
										{$inc: {wallet_balance: cashout_amount}}
									);

									await new HistoryDB({
										type: "Cash Out",
										amount: cashout_amount,
										owner_id: validAccount._id.toString(),
										date: req.body.date
									}).save();

									res.status(200).json({message: "successful", cashout_amount});
								}

								
							}else{
								res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
								res.status(401).json({message: "login needed"});
							}
						}else{
							res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
							res.status(401).json({message: "login needed"});
						}
					}
				}else{
					res.status(401).json({message: "Invalid Coil ID"});
				}
			}else{
				res.status(401).json({message: "Invalid Coil ID"});
			}
		}else{
			res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
			res.status(401).json({message: "login needed"});
		}

	}catch(error){
		const error_second = (Date.now - startTime) / 1000;
		customMiddleware.catchError(error, res, error_second);
	}
	
}







module.exports = {
	get_investment,
	post_investment
};



