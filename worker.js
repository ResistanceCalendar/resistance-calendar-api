'use strict';

const Agenda = require('agenda');
const config = require('./config');
const facebookEtl = require('./jobs/facebook-etl');
require('./lib/database');  // Has side effect of connecting to database

facebookEtl();
