const jwt = require("jsonwebtoken");
const AccountDB = require("./register/registerSchema.js");
const RateDB = require("./director/rateSchema.js");
const nodemailer = require("nodemailer");




const getCookie = async(req, res)=>{

	let outGoing = null;

	const reqCookie = req.cookies.signature;
	
	if(reqCookie){
		await jwt.verify(reqCookie, process.env.SECRET, async(error, validCookie)=>{
			
			if(validCookie){
				const thisAccount = await AccountDB.findOne({_id: validCookie.id});
				if(thisAccount){
					outGoing = thisAccount;
				}
			}
		});
	}

	return outGoing;
};






const otp = async(email, otp)=>{
	let transporter = nodemailer.createTransport({
	    service: 'Gmail',
	    auth: {
	      user: 'info.doleef@gmail.com',
	      pass: 'ejkm vrdp jpoc xivm'
	    }
	});


	let mailOptions = {
	    from: 'info.doleef@gmail.com',
	    to: email,
	    subject: "Verification From CoilSpace",
	    text: `${otp} is your verification code, copy the code and use for verification.`
	};

	await transporter.sendMail(mailOptions);
}








	










const rate_by_country = async(country)=>{

	let rate = 0;
	const rateDB = await RateDB.findOne().sort({_id: -1});

	if(country === "Australia"){
		rate = rateDB.australia_rate
	}else if(country === "Canada"){
		rate = rateDB.canada_rate
	}else if(country === "Ghana"){
		rate = rateDB.ghana_rate
	}else if(country === "India"){
		rate = rateDB.india_rate
	}else if(country === "Kenya"){
		rate = rateDB.kenya_rate
	}else if(country === "Nigeria"){
		rate = rateDB.nigeria_rate
	}else if(country === "Pakistan"){
		rate = rateDB.pakistan_rate
	}else if(country === "Philippines"){
		rate = rateDB.philippines_rate
	}else if(country === "South Africa"){
		rate = rateDB.south_africa_rate
	}else if(country === "Tanzania"){
		rate = rateDB.tanzania_rate
	}else if(country === "Uganda"){
		rate = rateDB.uganda_rate
	}else if(country === "UK"){
		rate = rateDB.uk_rate
	}else if(country === "USA"){
		rate = rateDB.usa_rate
	}


	return rate;
}













const logger = (print)=>{
	const port = process.env.PORT || 9000;
	if(port === 9000){
		console.log(print)
	}
}







const catchError = (error, res, error_second)=>{

	const stringing_error_object = ""+error+"";
	
	if(error_second > 25){
		res.status(504).json({message: "bad network"});
	}else if(stringing_error_object.includes("connection") || stringing_error_object.includes("Network") || stringing_error_object.includes("ENOTFOUND") || stringing_error_object.includes("Timeout")){
		res.status(504).json({message: "bad network"});
	}else if (error.code === 11000 && error.name === 'MongoError') {
		//when unique false in schema
		res.status(400).json({message: "Too many people on queue, please refresh and try again."});
	}else{
		logger(error);
		res.status(500).json({message: "Unknown Error Catched"});
	}
};









const sanitized = (data)=>{
	data = `${data}`;
	let allow = true;

	if(data.includes("{") && data.includes("}")){
		allow = false;
	}else if(data.includes("(") && data.includes(")")){
		allow = false;
	}else if(data.includes("[") && data.includes("]")){
		allow = false;
	}else if(data.includes(":") || data.includes("`") || data.includes(';') || data.includes("&&") || data.includes("||") || data.includes("^") || data.includes("\\n") || data.includes("\\r") || data.includes("\\t")){
		allow = false;
	}

	return allow;

}




















const get_date = ()=>{
	const a = new Date();

	let zeroOfMonth = "0";
	let zeroOfDay = "0";

	if(parseInt(a.getMonth()) > 8){
		zeroOfMonth = "";
	}


	if(parseInt(a.getDate()) > 9){
		zeroOfDay = "";
	}


	const date = zeroOfDay + a.getDate() + "/" + zeroOfMonth + (parseInt(a.getMonth())+1) + "/" + a.getFullYear();

	return date;
}





module.exports = {
	otp,
	sanitized,
	logger,
	getCookie,
	get_date,
	catchError,
	rate_by_country
}