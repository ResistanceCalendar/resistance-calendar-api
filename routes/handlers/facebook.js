const Facebook = require('../../lib/facebook');

module.exports.events = {
  handler: function (request, reply) {
    Facebook.getOSDIEvents(function (err, osdiEvents) {
      if (err) {
        console.log('Error: ' + request + '\n' + err);
        reply(err);
        return;
      }
      const response = {
        total_pages: 1,
        per_page: osdiEvents.length,
        page: 1,
        total_records: osdiEvents.length,
        _embedded: {
          'osdi:events': osdiEvents
        }
      };
      return reply(response)
        .type('application/json');
    });
  }
};
