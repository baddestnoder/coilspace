const mongoose = require("mongoose");
const bcrypt = require("bcrypt");





const thisSchema = new mongoose.Schema({


	owner_id: {
		required: true,
		type: String
	},

	date: {
		required: true,
		type: String
	},

	type: {
		required: true,
		type: String
	},

	amount: {
		required: false,
		type: Number
	},

	item_id: {
		required: false,
		type: String
	},

	coil_id: {
		required: false,
		type: String
	},


	name: {
		required: false,
		type: String
	}
});




const Model = new mongoose.model("history", thisSchema);



module.exports = Model;