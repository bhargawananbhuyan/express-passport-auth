const { model, Schema } = require("mongoose");

module.exports = model(
	"User",
	new Schema({
		fullName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
	})
);
