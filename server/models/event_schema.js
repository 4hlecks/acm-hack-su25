const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const createEvent_Schema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,  
        unique: true
    },

    eventTitle: {
        type: String,
        required: true
    },

    eventOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    eventDate: {
        type: Date, 
        required: true
    },

    eventLocation: {
        type: String, 
        required: true,
    },

    eventDescription: {
        type: String,
        required: true
    },
    
    eventCategory: {
        type: String,
        enum: ['Fundraiser', 'Free Food', 'GBM'],
        required: true
    },

    eventSrc: {
        type: String,
        required: true
    }
});

module.exports = new mongoose.model('Event', createEvent_Schema);