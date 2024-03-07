const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt");






const thisSchema = new mongoose.Schema({

	fName: {
		required: true,
		type: String
	},


	lName: {
		required: true,
		type: String
	},


	email: {
		required: true,
		type: String,
	},

	password: {
		required: true,
		type: String,
	},

	country: {
		required: true,
		type: String
	},

	currency_format: {
		required: true,
		type: String
	},

	currency: {
		required: true,
		type: String
	},

	wallet_balance: {
		required: true,
		type: Number
	},

	index: {
		required: true,
		type: Number,
		unique: true
	},

	agent: {
		required: true,
		type: Boolean
	},

	whatsapp_link: {
		required: false,
		type: String
	},

	whatsapp_number: {
		required: false,
		type: Number
	},

	crime_rate: {
		required: true,
		type: Number
	},

	unavailable_rate: {
		required: true,
		type: Number
	},

	rude_rate: {
		required: true,
		type: Number
	},

	new_agent_point: {
		required: true,
		type: Number
	},

	rate_ban: {
		required: true,
		type: Boolean
	},

	account_ban: {
		required: true,
		type: Boolean
	},

	invited_by: {
		required: false,
		type: String
	},

	referral_commission: {
		required: true,
		type: Number
	},

	number_of_referral: {
		required: true,
		type: Number
	}

});









thisSchema.pre("save", async function(next){
	let salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});



thisSchema.statics.login = async function(email, password){

	const foundAccount = await this.findOne({email});

	if(foundAccount){
		const correctPassword = await bcrypt.compare(password, foundAccount.password);

		if(correctPassword){
			return foundAccount;
		}else{
			return "Verification Failed";
		}
	}else{
		return "Verification Failed";
	}
};




const ThisModel = mongoose.model("useraccount", thisSchema);

module.exports = ThisModel;