const mongoose = require("mongoose");
const bcrypt = require("bcrypt");




const thisSchema = new mongoose.Schema({

	invested_amount: {
		required: true,
		type: Number
	},

	coil_id: {
		required: true,
		type: String
	},

	owner_id: {
		required: true,
		type: String
	},

	unit: {
		required: true,
		type: Number
	},

	value: {
		required: true,
		type: Number
	},

	shareable: {
		required: true,
		type: Boolean
	},

	toShare: {
		required: true,
		type: Number
	},


	total_DB_unit: {
		required: true,
		type: Number
	},

	totalInvestment: {
		required: true,
		type: Number
	},

	date: {
		required: true,
		type: String
	}

});




const ThisModel = new mongoose.model("investment", thisSchema);




module.exports = ThisModel;