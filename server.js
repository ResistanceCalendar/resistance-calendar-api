/** hapijs default hello world **/

'use strict';

const Hapi = require('hapi');
const FB = require('fbgraph');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    port: process.env.PORT || 8000
});

// Add the route
server.route({
    method: 'GET',
    path:'/',
    handler: function (request, reply) {
        return reply('hello world');
    }
});

// Register the additional plugins
const plugins = [{
    register: require('./lib/modules/facebook')
}]
server.register(plugins, function() {
  // Start the server
  server.start((err) => {
        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });
});
