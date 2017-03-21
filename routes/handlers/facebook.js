const Facebook = require('../../lib/facebook');

/**
 * Example:
 *  Facebook.events(function (err, result) {...})
 */
module.exports.events = function (next) {
  Facebook.getOSDIEvents(function (err, osdiEvents) {
    if (err) {
      console.log('Error: ' + JSON.stringify(err));
      next(err);
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
    next(null, response);
  });
};
