const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    player: {
        type: String,
        require: true,
    },
    opponent: {
        type: String,
        require:true
    },
    score: {
        type: Number,
        require: true
    }
})

const gamesSchema = new mongoose.Schema({
    tournament: {
        type: mongoose.ObjectId,
        unique: true,
        require: true
    },
    games: {
        type: [gameSchema],
        default: [],
    }
})

const Games = mongoose.model('Games', gamesSchema);

module.exports = { Games };