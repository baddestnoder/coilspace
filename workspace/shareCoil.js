const express = require("express");
const InvestmentDB = require("./investment/investmentSchema.js");
const customMiddleware = require("./customMiddleware.js");




const router = express.Router();





router.get("/shareCoil", async(req, res)=>{
	res.render("shareCoil.ejs");
});












router.post("/shareCoil", async(req, res)=>{

	const startTime = Date.now();
	req.setTimeout(300000);





	const keepSharing = async()=>{

		try{


			const first_sharable = await InvestmentDB.findOne({shareable: true}).sort({_id: 1});

			if(first_sharable){
				await InvestmentDB.updateMany(
					{shareable: false},
					{$inc: {value: first_sharable.toShare}},
					{new: true}
				);

				await InvestmentDB.findOneAndUpdate({_id: first_sharable._id}, {$set: {shareable: false}});


					

				if((Date.now() - startTime) > 275000){
					res.json({message: "time out reached"})
				}else{
					res.json({unit: first_sharable.unit, message: "One share completed", time: (Date.now() - startTime) / 1000});
				}
			}else{
				res.json({message: "finished", time: (Date.now() - startTime) / 1000});
			}

		}catch(error){
			customMiddleware.catchError(error, res, 0);
		}
	}


	keepSharing();
		
});








module.exports = router;