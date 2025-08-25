const mongoose = require('mongoose');
const User = require('./users_schema');

const clubSchema = new mongoose.Schema({
	bio: {type: String, default: ""}
});

const Club = User.discriminator('club', clubSchema)
module.exports = Club;