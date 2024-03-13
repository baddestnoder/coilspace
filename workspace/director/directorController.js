const express = require("express");
const customMiddleware = require("../customMiddleware.js");
const RateSchema = require("./rateSchema.js");


const router = express.Router();




router.get("/director", async(req, res)=>{
	const  data = await RateSchema.findOne().sort({_id: -1}).limit(1);
	res.render("director.ejs", {data});
});




router.post("/update_rate", async(req, res)=>{

	const startTime = Date.now();


	try{

		//converting incoming data value and keys to array
		const incomomgDataValue = Object.values(req.body);
		const incomomgDataKey = Object.keys(req.body);

		let malicious = "none";

		incomomgDataValue.forEach((each, i)=>{
			if(customMiddleware.sanitized(each) === false){
				malicious = incomomgDataKey[i];
			}
		});

		if(malicious === "none"){
			const incomomgData = {
				australia_rate: parseFloat(req.body.australia_rate),
				canada_rate: parseFloat(req.body.canada_rate),
				ghana_rate: parseFloat(req.body.ghana_rate),
				india_rate: parseFloat(req.body.india_rate),
				kenya_rate: parseFloat(req.body.kenya_rate),
				nigeria_rate: parseFloat(req.body.nigeria_rate),
				pakistan_rate: parseFloat(req.body.pakistan_rate),
				philippines_rate: parseFloat(req.body.philippines_rate),
				south_africa_rate: parseFloat(req.body.south_africa_rate),
				tanzania_rate: parseFloat(req.body.tanzania_rate),
				uganda_rate: parseFloat(req.body.uganda_rate),
				uk_rate: parseFloat(req.body.uk_rate),
				usa_rate: parseFloat(req.body.usa_rate)
			};

			await new RateSchema(incomomgData).save();
			res.status(200).json({message: "successful"});
		}else{
			res.status(401).json({message: "security attack"});
		}


	}catch(error){

		const error_second = (Date.now - startTime) / 1000;
		customMiddleware.catchError(error, res, error_second);
	}
});










module.exports = router;