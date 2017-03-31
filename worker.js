'use strict';

const Agenda = require('agenda');
const config = require('./config');
const facebookEtl = require('./jobs/facebook-etl');
require('./lib/database');  // Has side effect of connecting to database

const agenda = new Agenda({db: {address: config.mongoUri}});

agenda.define('facebook-etl', facebookEtl);

agenda.on('start', function (job) {
  console.log('Job %s starting', job.attrs.name);
});

agenda.on('ready', function () {
  console.log('Worker processes ready...');
  agenda.every('1 hour', 'facebook-etl');
  agenda.now('facebook-etl');
  agenda.start();
});
