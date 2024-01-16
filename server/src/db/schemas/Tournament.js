const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    organizer: {
        type: String,
        default: "Website",
        required: true,
    },
    name: {
        type: String,
        default: "Tournament",
        required: true,
    },
    discipline: {
        type: String,
        default: "Chess",
        required: true,
    },
    time: {
        type: Date,
        required: true,
    },
    applicationDeadline: {
        type: Date,
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    maxParticipants: {
        type: Number,
        required: true,
    },
    sponsorLogos: {
        type: [String], 
    },
    rankedPlayers: {
        type: Number,
        required: true,
    },
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = { Tournament };