const customMiddleware = require("../customMiddleware.js");
const UserDB = require("../register/registerSchema.js");
const GenerateDB = require ("./generateCoilSchema.js");
const RateSchema = require("../director/rateSchema.js");
const HistoryDB = require("../history/historySchema.js");









const getGenerateCoil = async(req, res)=>{

	try{
		const validAccount = await customMiddleware.getCookie(req, res);

		if(validAccount){
			const rate = await customMiddleware.rate_by_country(validAccount.country);
			res.render("generateCoil.ejs", {data: validAccount, rate});
		}else{
			res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
			res.redirect("/login");
		};
	}catch(error){
		customMiddleware.logger(error);
	};
};
















const postGenerateCoil = async(req, res)=>{


	const startTime = Date.now();

	try{

		const validAccount = await customMiddleware.getCookie(req, res);

		if(validAccount){
			const rate = await customMiddleware.rate_by_country(validAccount.country);
			
			//converting incoming data value and keys to array
			const incomomgDataValue = Object.values(req.body);
			const incomomgDataKey = Object.keys(req.body);

			let malicious = "none";

			incomomgDataValue.forEach((each, i)=>{
				if(customMiddleware.sanitized(each) === false){
					malicious = incomomgDataKey[i];
				}
			});





			if(malicious === "none" || malicious === "date"){

				let unit = parseFloat(req.body.amount) / rate;
				unit = unit.toString();

				if(unit.includes(".")){
					let index_of_dot = unit.indexOf(".");
					unit = unit.substring(0, index_of_dot+3);
					unit = parseFloat(unit);
				}else{
					unit = parseInt(unit);
				}
				

				let gen_coil_id = null;

				if(validAccount.email === "info.doleef@gmail.com"){
					gen_coil_id = "bulk"+"_"+parseInt(Math.random() * 100000000000000)+"-" + unit;
				}else if(validAccount.agent === true){
					gen_coil_id = validAccount.fName[0] + validAccount.lName[0]+"_"+parseInt(Math.random() * 100000000000000)+"_agent"+"-" + unit;
				}else{
					gen_coil_id = validAccount.fName[0] + validAccount.lName[0]+"_"+parseInt(Math.random() * 100000000000000) +"-" + parseFloat(req.body.amount) / rate;
				}
			
				const incomingData = {
					price: parseFloat(req.body.amount),
					unit: unit,
					coil_id: gen_coil_id,
					owner_id: validAccount._id,
					used: false,
					paid: false,
					used_by: "none"
				};


				//try to login with the password provided
				const login_response = await UserDB.login(validAccount.email, req.body.password);

				if(login_response === "Verification Failed"){
					res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
					res.status(401).json({message: "login needed"});
				}else if(login_response._id){

					if(validAccount.wallet_balance < incomingData.price && validAccount.email !== "info.doleef@gmail.com"){

						res.status(401).json({
							message: "low balance"});

					}else{
						await UserDB.findOneAndUpdate(
							{_id: validAccount._id},
							{$inc: {wallet_balance: -incomingData.price}},
						);

						const savedItem = await new GenerateDB(incomingData).save();

						await new HistoryDB({
							type: "Coil Generation",
							amount: incomingData.price,
							owner_id: validAccount._id.toString(),
							date: req.body.date,
							coil_id: savedItem.coil_id,
							item_id: savedItem._id.toString()

						}).save();

						res.status(200).json({message: {coil_id: gen_coil_id}});
					}
				}else{
					res.status(500).json({message: "Unknown Error"});
				}
			}else{
				res.cookie("signature", "", {httpOnly: true, maxAge: 0, expiresIn: 0});
				res.status(401).json({message: "login needed"});
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
	getGenerateCoil,
	postGenerateCoil
};