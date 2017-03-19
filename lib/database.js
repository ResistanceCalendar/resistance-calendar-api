const mongoose = require('mongoose');
const config = require('../config');
const promiseOptions = {
  promiseLibrary: require('bluebird')
};

let db = mongoose.createConnection(config.mongoUri, promiseOptions);

mongoose.connect(config.mongoUri);

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback () {
  console.log('Connection with database succeeded.');
});

module.exports = db;
