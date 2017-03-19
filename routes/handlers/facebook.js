const Facebook = require('../../lib/facebook');

module.exports.events = {
    handler: function (request, reply) {
        Facebook.getEvents(function (err, res) {
            return reply(res);
        });
    },
    plugins: {
        hal: {
            api: 'osdi:events'
        }
    }
};
