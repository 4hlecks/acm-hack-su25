const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const createEvent_Schema = new mongoose.Schema({
    eventId: {
        type: String,
        default: uuidv4,  
        unique: true
    },
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: true
    },
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    startDate: {
        type: Date, 
        required: true
    },

    endDate: {
        type: Date, 
        required: true
    },

    location: {
        type: String, 
        required: true,
    },
    
    category: {
        type: String,
        enum: ['GBMs', 'FreeFood', 'Fundraisers'],
        required: true
    }
});

module.exports = new mongoose.model('Event', createEvent_Schema);