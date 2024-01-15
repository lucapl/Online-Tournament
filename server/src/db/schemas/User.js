const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: String,
    confirmationToken: String,
    confirmed: {
        type: Boolean,
        default: false,
    },
});

const User = mongoose.model('User', userSchema);

module.exports = { User };