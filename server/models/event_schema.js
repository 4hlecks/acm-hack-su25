const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const createEvent_Schema = new mongoose.Schema({
    eventId: {
        type: String,
        default: uuidv4,
        unique: true
    },
    eventOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventTitle: {
        type: String,
        required: true
    },
    eventDescription: {
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
    startTime: {           
        type: String,
        required: true
    },
    endTime: {             
        type: String,
        required: true
    },
    eventLocation: {
        type: String,
        required: true,
    },
    eventCategory: {
        type: String,
        enum: ['GBM', 'FreeFood', 'Fundraiser'],
        required: true
    },
    
    tags: [{ type: String }], 
    // for uploading images
    coverPhoto: {            
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', createEvent_Schema);
