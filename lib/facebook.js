'use strict';

const FB = require('fbgraph');
FB.setVersion(process.env.FB_GRAPH_API_VERSION || '2.8');
FB.setAccessToken(process.env.FB_GRAPH_API_TOKEN)

/**
 * Example:
 *  Facebook.getEventrs(function(err, res) {...})
 */
module.exports.getEvents = function(callback) {
  FB.get('resistance-calendar/events', callback);
}
