const mongoose = require('mongoose');

const userPreferences_Schema = new mongoose.Schema({
    notification: [
        {
            club: {
                type: Schema.Types.ObjectId,
                ref: 'Club',
                required: true
            },
            subscribed: {
                type: Boolean,
                default: false
            }
        }
    ]
});

module.exports = new mongoose.model('userPreference', userPreferences_Schema);