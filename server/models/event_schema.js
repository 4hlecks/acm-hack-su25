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
    Date: {
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
        enum: [
          'GBM',
          'Free Food',
          'Fundraiser',
          'Game Night',
          'Networking',
          'Panel',
          'Social',
          'Study Jam',
          'Workshop'
        ],
        required: true
    },
    
    tags: [{ type: String }], 
    // for uploading images
    coverPhoto: {
        type: String,
        required: false
      }
}, { timestamps: true });

module.exports = mongoose.model('Event', createEvent_Schema);
