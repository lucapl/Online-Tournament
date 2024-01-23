const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true // Ensure unique emails within the array
    },
    licenseNumber: String,
    ranking: Number
})

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
    // location: {
    //     type: {
    //         type: String,
    //         enum: ['Point'],
    //         default: 'Point',
    //     },
    //     coordinates: {
    //         type: [Number],
    //         required: true,
    //     },
    // },
    location:{
        type: [Number],
        required:true
    },
    maxParticipants: {
        type: Number,
        required: true,
    },
    sponsorLogos: {
        type: [String], 
    },
    participants: {
        type: [participantSchema],
        default: [],
        validate: [
            {
                validator: function(aP){
                    return aP.length <= this.maxParticipants;
                },
                message: `Participants limit reached!`
            },
            {
                validator: function(aP){
                    const uniqueValues = new Set(aP);
                    return uniqueValues.size === aP.length;
                },
                message: `Participant can't sign up more than once!`
            }
        ]
    }   
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = { Tournament };