const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    clubId: {
		type: String,
		unique: true,
	},

	name: {
		type: String,
		required: true,
		trim: true
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

	bio: {
		type: String,
		default: ""
	},

	profilePic: {
		type: String,
		default: ""
    }
});

module.exports = mongoose.model('Club', clubSchema);