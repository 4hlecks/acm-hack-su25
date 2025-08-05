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
        ref: 'User',
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
    startTime: {           
        type: String,
        required: true
    },
    endTime: {             
        type: String,
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
    },
    tags: [{ type: String }], 
    // for uploading images
    coverPhoto: {            
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', createEvent_Schema);
