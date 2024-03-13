const mongoose = require("mongoose");
const bcrypt = require("bcrypt");





const thisSchema = new mongoose.Schema({

	price: {
		required: true,
		type: Number
	},

	unit: {
		required: true,
		type: Number
	},

	owner_id: {
		required: true,
		type: String
	},

	coil_id: {
		required: true,
		type: String
	},

	used: {
		required: true,
		type: Boolean
	},

	used_by: {
		required: true,
		type: String
	},

	paid: {
		required: true,
		type: Boolean
	},


});




const Model = new mongoose.model("generated_coil", thisSchema);



module.exports = Model;