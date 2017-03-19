/** hapijs default hello world **/

'use strict';

const Hapi = require('hapi'),
Db = require('./lib/database');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: process.env.PORT || 8000
});
//
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
    register: require('./routes')
}];

// Start the server after plugin registration
server.register(plugins, function() {
  server.start((err) => {
        if (err) {
            console.error(err);
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });
});
