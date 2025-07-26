const mongoose = require('mongoose');
const User = require('./users_schema');

const clubSchema = new mongoose.Schema({
    clubId: {type: String, unique: true},
	bio: {type: String, default: ""},
	profilePic: {type: String, default: ""}
});

const Club = User.discriminator('club', clubSchema)
module.exports = Club;