const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const cors = require('cors');
const mongoose = require('mongoose');

const router = require('./src/routing')
//const db = require('./src/db/database');

mongoose.connect('mongodb://127.0.0.1:27017/online_tournament',{
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const port = process.env.PORT || 8080;

app.use(cors({
  origin: '*'
}));

app.use("/",router);

server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

process.on('SIGINT', () => {
  //conn.close();
  mongoose.connection.close();
  process.exit(0);
});