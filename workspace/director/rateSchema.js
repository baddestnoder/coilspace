const mongoose = require("mongoose");




const thisSchema = new mongoose.Schema({

	australia_rate:{
		required: true,
		type: Number
	},

	canada_rate:{
		required: true,
		type: Number
	},

	ghana_rate:{
		required: true,
		type: Number
	},

	india_rate:{
		required: true,
		type: Number
	},

	kenya_rate:{
		required: true,
		type: Number
	},

	nigeria_rate:{
		required: true,
		type: Number
	},

	pakistan_rate:{
		required: true,
		type: Number
	},

	philippines_rate:{
		required: true,
		type: Number
	},

	south_africa_rate:{
		required: true,
		type: Number
	},

	tanzania_rate:{
		required: true,
		type: Number
	},

	uganda_rate:{
		required: true,
		type: Number
	},

	uk_rate:{
		required: true,
		type: Number
	},

	usa_rate:{
		required: true,
		type: Number
	}
});






const ThisModel = mongoose.model("rate", thisSchema);

module.exports = ThisModel;