'use strict';

const config = require('./config');

const Hapi = require('hapi');
const corsHeaders = require('hapi-cors-headers');
// require('./lib/database'); // contains side effect for initializing database

// Create a server with a host and port
const server = new Hapi.Server({
  cache: [{
    name: 'mongoCache',
    engine: require('catbox-mongodb'),
    uri: config.mongoUri,
    partition: 'cache'
  }]
});
server.connection({
  port: process.env.PORT || 8000
});

// Add the route
server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    return reply('hello world');
  }
});

// Register the additional plugins
const plugins = [{
  register: require('./routes')
}];

// Start the server after plugin registration
server.register(plugins, function () {
  server.start((err) => {
    if (err) {
      console.error(err);
      throw err;
    }
    server.ext('onPreResponse', corsHeaders);
    console.log('Server running at:', server.info.uri);
  });
});
