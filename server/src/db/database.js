const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/online_tournament',{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
const db = mongoose.connection;

module.exports = { db }