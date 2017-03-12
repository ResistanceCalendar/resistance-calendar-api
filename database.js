var Mongoose = require('mongoose'),
    config = require('./config');
var promise_options = { promiseLibrary: require('bluebird') };
var db = Mongoose.createConnection(config.mongoUri, promise_options);

mongoose.connect(config.monngoUri);

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
    console.log("Connection with database succeeded.");
});

module.exports = db;