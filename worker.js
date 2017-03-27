'use strict';

const Agenda = require('agenda');
const config = require('./config');
const facebookEtl = require('./jobs/facebook-etl');
require('./lib/database');  // Has side effect of connecting to database

const agenda = new Agenda({db: {address: config.mongoUri + '/agenda'}});

agenda.define('facebook-etl', facebookEtl);

agenda.on('ready', function () {
  agenda.now('facebook-etl');
  agenda.start();
});
