const Facebook = require('../../lib/facebook');

module.exports.events = {
  handler: Facebook.getEvents(function(err, res) {
    return reply(res).type('application/json');
  })
};
